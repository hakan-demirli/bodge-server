import threading, queue

class BpBoilerplate(threading.Thread):

    my_q = None
    all_q = {}

    def __init__(self):
        threading.Thread.__init__(self)

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