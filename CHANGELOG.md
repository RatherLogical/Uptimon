# Upcoming Changes

- Administration panel.
- Notifications through Slack, Discord, SMTP, SMS (Twilio), etc...

# v0.1.0 - Beta 3 (currently underway)

> **NOTICE:** Your Uptimon installation's database will need to be wiped in order for the ssl validation to work properly.
- **ADDED** It was previously only possible to get uptime data for the last 24 hours. Now you can choose the time range of uptime data to display on the frontend. ***IN QUEUE***
- **ADDED** A graphical installer. ***DONE***
- **ADDED** SSL validation. ***IN QUEUE***
- **FRONTEND** Added an option to set the page title. ***DONE***
- **FRONTEND** Refined the responsiveness of the frontend a bit more. ***DONE***
- **PERFORMANCE** Uptimon can now handle many more checks. The backend is using cURL multi which means multiple connections can be made simultaneously. Before, only one connection could be made at a time. ***IN PROGRESS***
- **PERFORMANCE** Reduced amount of cURL requests made for each check to 1. ***DONE***
- **PERFORMANCE** Reduced amount of code that has to be executed for each check. ***DONE***
- **TWEAK** Changed all occurrences of uptimeter to uptimon. ***DONE***
- **TWEAK** Changed suggested filesystem path from `/var/www/uptime` to `/var/www/uptimon`. ***DONE***
- **FIX** The cURL timeout works now. ***DONE***
- **FIX** If an invalid IP or domain is added as a check, give a friendly error instead of breaking. ***IN QUEUE***

# v0.0.3 - Beta 2.5
- **ADDED** Added an overall status indicator at the top of the page for at-a-glance status info.
- **ADDED** A fully customizable header.
  * Able to set a custom logo in SVG and PNG format by replacing the "logo.png" and "logo.svg" files.
  * Able to set the status page heading text.
  * Able to set the status page description.
- **FRONTEND** More options to customize the colors.
- **FRONTEND** "Live Update Enabled" text is now hidden if live update is not enabled.
- **FRONTEND** Added a slight text shadow to improve legibility of text.

# v0.0.3 - Beta 2

- **FRONTEND** Uptimon client is now fully responsive across all device screen sizes!

# v0.0.2 - Beta 1

- **INFO** Uptimon is now out of alpha and has instructions for installation.

# v0.0.1 - Alpha 1

- **INFO** The initial pre-release of Uptimon.
