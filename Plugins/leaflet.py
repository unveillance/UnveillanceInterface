import tornado.web, requests

class LeafletHandler(tornado.web.RequestHandler):
	@tornado.web.asynchronous
	def get(self, uri):
		r = requests.get("http://cdn.leafletjs.com/leaflet-0.7.3/%s" % uri)
		self.finish(r.content)