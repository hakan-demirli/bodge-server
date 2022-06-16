from gcsa.google_calendar import GoogleCalendar

gc = GoogleCalendar(credentials_path='./credentials.json')
print(gc)
page_token = None

for event in gc:
    print(event)
    print(gc.service.calendarList().list(pageToken=page_token).execute())

calendar = gc.service.calendars().get(calendarId='snd62m49s4fheg7mtsd950m300@group.calendar.google.com').execute()


import json
print()

page_token = None
while True:
  events =  gc.service.events().list(calendarId='primary', pageToken=page_token).execute()
  for event in events['items']:
    print(json.dumps(event,sort_keys=True, indent=4))
  page_token = events.get('nextPageToken')
  if not page_token:
    break
