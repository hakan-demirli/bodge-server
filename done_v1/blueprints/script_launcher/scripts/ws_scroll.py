#!/usr/bin/env python
from pynput import mouse
from pynput.keyboard import Key, Controller
import json

config = {'xMin': 1880,'xMax':1920,'yMin': 0,'yMax':50}

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
