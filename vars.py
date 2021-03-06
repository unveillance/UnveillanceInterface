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


