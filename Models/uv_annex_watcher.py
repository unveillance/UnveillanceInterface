import os, re, requests, json
from time import sleep
from threading import Thread

from fabric.api import settings, local
from fabric.context_managers import hide

from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

from conf import DEBUG, ANNEX_DIR, MONITOR_ROOT, getConfig, buildServerURL, SERVER_HOST, SERVER_PORT

try:
	from conf import GIT_ANNEX
except ImportError as e:
	GIT_ANNEX = None

try:
	from lib.Core.Utils.funcs import startDaemon, stopDaemon, generateMD5Hash, hashEntireFile, hashEntireStream
except ImportError as e:
	from lib.Frontend.lib.Core.Utils.funcs import startDaemon, stopDaemon, generateMD5Hash, hashEntireFile, hashEntireStream

try:
	from Models.uv_fabric_process import UnveillanceFabricProcess
except ImportError as e:
	from lib.Frontend.Models.uv_fabric_process import UnveillanceFabricProcess

try:
	from Utils.fab_api import netcat
except ImportError as e:
	from lib.Frontend.Utils.fab_api import netcat

try:
	from Utils.fab_api import register_upload_attempt
except ImportError as e:
	from lib.Frontend.Utils.fab_api import register_upload_attempt

try:
	from lib.Core.Models.uv_task_channel import UnveillanceTaskChannel
except ImportError as e:
	from lib.Frontend.lib.Core.Models.uv_task_channel import UnveillanceTaskChannel

class UnveillanceFSEHandler(FileSystemEventHandler):
	def __init__(self):
		self.watcher_pid_file = os.path.join(MONITOR_ROOT, "watcher.pid.txt")
		self.watcher_log_file = os.path.join(MONITOR_ROOT, "watcher.log.txt")

		self.annex_observer = Observer()
		self.netcat_queue = []
		self.cleanup_upload_lock = False

		FileSystemEventHandler.__init__(self)

	def checkForDuplicate(self, _id, from_file=None):
		if from_file is not None and _id is None:
			_id = self.get_new_hash(file)

		url = "%s/documents/?_id=%s" % (buildServerURL(), _id)
		try:
			r = requests.get(url, verify=False)
		except Exception as e:
			if DEBUG:
				print e
			return None

		try:
			r = json.loads(r.content)
			if 'data' in r.keys():
				return r['data']
		except Exception as e:
			if DEBUG:
				print e

		return None

	def cleanupUploads(self):
		# THIS ANNOYS ME.
		# self.cleanup_upload_lock = True
		if DEBUG:
			print "starting watcher cleanup cron job"

	def addToNetcatQueue(self, netcat_stub, send_now=True):
		if netcat_stub['save_as'] not in [ns['save_as'] for ns in self.netcat_queue]:
			self.netcat_queue.append(netcat_stub)

		return self.uploadToAnnex(netcat_stub)

	def get_new_hash(self, file):
		if type(file) in [str, unicode]:
			new_hash = hashEntireFile(file)
		else:
			new_hash = hashEntireStream(file)

		if DEBUG:
			print "NEW HASH: %s" % new_hash

		return new_hash

	def uploadToAnnex(self, netcat_stub):
		use_git_annex = False
		this_dir = os.getcwd()
		os.chdir(ANNEX_DIR)

		if type(netcat_stub['file']) in [str, unicode]:
			if GIT_ANNEX is not None:
				use_git_annex = True
				if DEBUG:
					print "GIT ANNEX ATTACHED TO INSTANCE."

			if use_git_annex:
				with settings(warn_only=True):
					# has this stub been uploaded?
					is_absorbed = local("%s metadata \"%s\" --json --get=uv_uploaded" % (
						GIT_ANNEX, netcat_stub['save_as']), capture=True)

					if DEBUG: print "%s absorbed? (uv_uploaded = %s type = %s)" % (
						netcat_stub['save_as'], is_absorbed, type(is_absorbed))

					if is_absorbed == "" or "False":
						is_absorbed = False
					elif is_absorbed == "True":
						is_absorbed = True
					else:
						is_absorbed = False
			else:
				is_absorbed = False
		else:
			is_absorbed = False

		if is_absorbed:
			if DEBUG: print "%s IS absorbed (uv_uploaded = %s)" % (
				netcat_stub['save_as'], is_absorbed)
			
			os.chdir(this_dir)
			return None

		new_hash = self.get_new_hash(netcat_stub['file'])

		possible_duplicate = self.checkForDuplicate(new_hash)
		if possible_duplicate is not None:

			if DEBUG: 
				print "Document already exists in Annex and will not be uploaded!  Here it is:"
				print possible_duplicate

			p = UnveillanceFabricProcess(register_upload_attempt, {'_id' : possible_duplicate['_id'] })
			p.join()

			os.chdir(this_dir)
			self.netcat_queue.remove(netcat_stub)

			possible_duplicate = self.checkForDuplicate(possible_duplicate['_id'])
			possible_duplicate.update({
				'uploaded' : False,
				'duplicate_attempt' : True
			})
			return possible_duplicate
		
		with settings(warn_only=True):
			new_save_as = generateMD5Hash(content=new_hash, salt=local("whoami", capture=True))
		
		if type(netcat_stub['file']) in [str, unicode]:
			new_file = netcat_stub['file'].replace(netcat_stub['save_as'], new_save_as)

			with settings(warn_only=True):
				local("mv \"%s\" %s" % (netcat_stub['file'], new_file))

				if use_git_annex:
					local("%s metadata %s --json --set=uv_file_alias=\"%s\"" % (GIT_ANNEX, new_file, netcat_stub['save_as']))

			netcat_stub['file'] = new_file

		netcat_stub['alias'] = netcat_stub['save_as']
		netcat_stub['save_as'] = new_save_as
		success_tag = False

		# look up to see if this file is already in the annex

		with settings(warn_only=True):
			if type(netcat_stub['file']) in [str, unicode] and use_git_annex:
				local("%s add %s" % (GIT_ANNEX, netcat_stub['save_as']))

			p = UnveillanceFabricProcess(netcat, netcat_stub)
			p.join()

			if p.error is None and p.output is not None:
				success_tag = True

			if DEBUG:
				print "NETCAT RESULT: (type=%s, success=%s)" % (type(p.output), success_tag)
				print "NETCAT ERROR (none is good!): (type=%s)" % type(p.error)

			if p.output is not None and DEBUG:
				for o in p.output:
					print "\n%s\n" % o

			if p.error is not None and DEBUG:
				print "ERROR:"
				print p.error

			if type(netcat_stub['file']) in [str, unicode] and use_git_annex:
				local("%s metadata \"%s\" --json --set=uv_uploaded=%s" % (
					GIT_ANNEX, netcat_stub['save_as'], str(success_tag)))

			self.netcat_queue.remove(netcat_stub)

		os.chdir(this_dir)
		return { 'uploaded' : success_tag, '_id' : new_hash } 

	def on_created(self, event):
		use_git_annex = False

		if GIT_ANNEX is not None:
			if DEBUG:
				print "GIT ANNEX ATTACHED TO INSTANCE."

			use_git_annex = True

		if event.event_type != "created":
			return

		if event.src_path == os.path.join(ANNEX_DIR, ".git"):
			print "is git..."
			print event.src_path
			return

		if re.match(re.compile("%s/.*" % os.path.join(ANNEX_DIR, ".git")), event.src_path) is not None:
			return

		if re.match(r'.*\.DS_Store', event.src_path) is not None:
			return

		if re.match(r'.*/\._*', event.src_path) is not None:
			return

		sleep(3)

		filename = event.src_path.split("/")[-1]
		never_upload = False

		if use_git_annex:
			with settings(warn_only=True):
				# has this stub been uploaded?
				never_upload = local("%s metadata \"%s\" --json --get=uv_never_upload" % (
					GIT_ANNEX, filename), capture=True)

				if DEBUG: 
					print "%s valid? (uv_never_upload = %s type = %s)" % ( \
						filename, never_upload, type(never_upload))

				if never_upload == "True": 
					never_upload = True
				elif never_upload == "":
					never_upload = False

		print "NEVER UPLOAD? %s" % never_upload
		if never_upload:
			return

		netcat_stub = None
		try:
			netcat_stub = [ns for ns in self.netcat_queue if ns['save_as'] == filename][0]
		except Exception as e: 
			if DEBUG: print "NO NETCAT STUB FOUND FOR %s" % filename

		#if DEBUG: print "NEW EVENT:\ntype: %s\nis dir: %s\npath: %s\n" % (event.event_type, event.is_directory, event.src_path)

		if netcat_stub is None:
			netcat_stub = {
				'file' : event.src_path,
				'save_as' : filename,
				'importer_source' : "file_added"
			}

			self.addToNetcatQueue(netcat_stub)

		sleep(5)

	def on_message(self, message):
		print "MESSAGE: %s" % message

	def on_open(self, info):
		print "ON OPEN"

	def on_close(self):
		print "ON CLOSE"

	def startAnnexObserver(self):
		print "STARTING OBSERVER on %s" % ANNEX_DIR

		startDaemon(self.watcher_log_file, self.watcher_pid_file)
		self.annex_observer.schedule(self, ANNEX_DIR, recursive=True)
		self.annex_observer.start()
		
		while True: 
			sleep(1)

		'''
			if not self.cleanup_upload_lock:
				t = Thread(target=self.cleanupUploads) 
				t.start()
		'''

	def stopAnnexObserver(self):
		print "STOPPING OBSERVER"
		self.annex_observer.stop()
		self.annex_observer.join()

		stopDaemon(self.watcher_pid_file)
