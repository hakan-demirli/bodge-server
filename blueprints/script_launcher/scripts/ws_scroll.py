#!/usr/bin/env python
from pynput import mouse
from pynput.keyboard import Key, Controller
import json
from time import sleep

config = {'xMin': 1870,'xMax':1921,'yMin': -1,'yMax':55}

keyboard = Controller()

def on_scroll(x, y, dx, dy):
    if (x > config['xMin'] and x < config['xMax'] and y > config['yMin'] and y < config['yMax']):
        keyboard.press(Key.cmd_l)
        keyboard.press(Key.ctrl)
        if dy < 0:
            keyboard.press(Key.right)
        else:
            keyboard.press(Key.left)

        keyboard.release(Key.cmd_l)
        keyboard.release(Key.ctrl)
        if dy < 0:
            keyboard.release(Key.right)
        else:
            keyboard.release(Key.left)
        #print('Scrolled {0} at {1}'.format('down' if dy < 0 else 'up',(x, y)))

with mouse.Listener(on_scroll=on_scroll) as listener:
    listener.join()
