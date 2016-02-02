import os
from collections import namedtuple
from lib.Core.vars import *

PostBatchRequestStub = namedtuple("PostBatchRequestStub", "files uri")
class PostBatchStub(object):
	def __init__(self, files, uri):
		self.request = PostBatchRequestStub(files, uri)

unveillance_cookie = namedtuple("unveillance_cookie", "ADMIN USER PUBLIC")
UnveillanceCookie = unveillance_cookie("uv_admin", "uv_user", "uv_public")

FILE_NON_OVERWRITES = []
IMPORTER_SOURCES = ["file_added"]
APP_DIR = os.path.join(os.path.abspath(os.path.join(__file__, os.pardir, os.pardir, os.pardir)), "app")

USER_CREDENTIAL_PACK = {
	"username" : "",
	"saved_searches" : [],
	"session_log" : [],
	"annex_key_sent" : False
}

CONTENT_TYPES = {
	'json' : "application/json",
	'js' : "application/javascript",
	'html' : "text/html",
	'jpg' : "image/jpeg",
	'png' : "image/png",
	'css' : "text/css",
	'mp4' : "video/mp4",
	'ogg' : "video/ogg",
	'ogv' : "video/ogg"
}

def get_task_pool():
	import re
	from conf import BASE_DIR
	
	task_pool = []
	
	annex_tasks = os.path.join(os.getenv('UNVEILLANCE_BUILD_HOME'), "src", "unveillance", "lib", "Annex", "lib", "Worker", "Tasks")
	local_tasks = BASE_DIR.replace("gui/lib/Frontend", "annex/Tasks")

	for task_dir in [annex_tasks, local_tasks]:
		for _, dirs, _ in os.walk(task_dir):
			for d in dirs:
				for _, _, files in os.walk(os.path.join(task_dir, d)):
					for f in [f for f in files if f not in ['__init__.py', 'evaluate_file.py', 'evaluate_document.py', 'pull_from_annex.py']]:
						with open(os.path.join(task_dir, d, f), 'rb') as F:
							task_name = None
							for line in F.readlines():
								if line.strip() == "@celery_app.task":
									task_name = True
									continue

								if type(task_name) is bool and task_name:
									try:
										task_name = re.findall(r'def\s([a-zA-Z][\d\w\-_/]*)\(.*\)\:$', line.strip())[0]
									except Exception as e:
										print e, type(e)

								if type(task_name) in [str, unicode]:
									task_pool.append("%s.%s.%s" % (d, f.replace(".py", ""), task_name))
									break
		
			break	

	return task_pool


