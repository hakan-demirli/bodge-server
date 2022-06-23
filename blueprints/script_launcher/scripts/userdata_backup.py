import sys
import pathlib
import shutil
import os
import datetime

def get_datadir() -> pathlib.Path:

    """
    Returns a parent directory path
    where persistent application data can be stored.

    # linux: ~/.local/share
    # macOS: ~/Library/Application Support
    # windows: C:/Users/<USER>/AppData/Roaming
    """

    home = pathlib.Path.home()

    if sys.platform == "win32":
        return home / "AppData/Roaming"
    elif sys.platform == "linux":
        return home / ".local/share"
    elif sys.platform == "darwin":
        return home / "Library/Application Support"

# create your program's directory

my_datadir = get_datadir() / "ScriptCenter"

try:
    my_datadir.mkdir(parents=True)
except FileExistsError:
    pass

print(my_datadir)
user_data = pathlib.Path(__file__).parent.parent.parent
print(user_data)
backup_folder = my_datadir / "userdata_backup"

try:
    backup_folder.mkdir(parents=True)
except FileExistsError:
    pass



a = datetime.datetime.now().strftime("%Y_%m_%d_%H_%M_%S")
print(a)
backup_folder_latest = backup_folder / a

try:
    backup_folder_latest.mkdir(parents=True)
except FileExistsError:
    pass

for index, path in enumerate(user_data.rglob('*.json')):
    print(path)
    shutil.copy2(path, (backup_folder_latest / path.name))