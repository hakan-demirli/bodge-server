import threading
import logging, sys
logging.basicConfig(stream=sys.stderr, level=logging.INFO)

class Plugin(threading.Thread):

    def __init__(self, all_q, my_q):
        threading.Thread.__init__(self)
        self.all_q = all_q
        self.my_q = my_q

    def run(self):
        t = threading.current_thread()
        while getattr(t, "do_run", True):
            if not self.my_q.empty():
                pobj = self.my_q.get()
                self.queue_task(pobj)
                self.my_q.task_done()
            else:
                self.regular_task()

    def regular_task(self):
        raise NotImplementedError()

    def queue_task(self, jsn):
        raise NotImplementedError()