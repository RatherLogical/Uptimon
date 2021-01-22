**Screenshots**

# Some Online Services
![Some Online Services](https://github.com/RatherLogical/Uptimon/raw/master/images/screenshot_1.png)

# An Offline Service
![An Offline Service](https://github.com/RatherLogical/Uptimon/raw/master/images/screenshot_2.png)

# We Have Tooltips!
![We Have Tooltips!](https://github.com/RatherLogical/Uptimon/raw/master/images/screenshot_3.png)

# Installation

Never download from master unless you want to hack on Uptimon. Get the latest release https://github.com/RatherLogical/Uptimon/releases because it has already been compiled.

## Backend

Requirements
- A linux OS - CRON jobs are used to trigger events, therefore linux is required.
- A Web Server (NGINX, Apache, etc...). I have only tested Uptimon with NGINX, but it should work with other web servers.
- PHP (Only guaranteed to work on the latest versions of PHP; 7.4+, not tested with PHP 8.0 yet).
- MySQL (Only tested with MySQL v8, should work with older versions).

To start you need to set the time zone at the top of the ``config.php`` file, you will also need to add your services to the list (obviously remove the default entries), and set up your MySQL database information.

A sample NGINX config file is included in the ``/configs`` directory of the repo. This should provide you with a good starting point. Aside from that please ensure your document root is not outside of the ``/app/public`` directory for security/abuse concerns after installation.

**You might have to set your open_basedir to the root of your vhosts dir; for example on NGINX with php-fpm: ``fastcgi_param PHP_ADMIN_VALUE "open_basedir=$base/:/usr/lib/php/:/tmp/:/var/www";``.**

You will need to edit your system's crontab file ``crontab -e`` on Ubuntu and add the contents of ``/configs/uptime-monitor.crontab``; **note that you need to edit the paths listed in the sample crontab file to match your setup**.

## Frontend

Requirements
- This is a SPA (single page app); all you need is the ability to host a static site (Can be hosted on a separate server if needed).

All you need to do to configure the frontend is edit the ``config.js`` file to reflect your installation.

# Say Hi to Uptimon - A New Uptime Monitoring Solution

I have tried literally every status page out there; paid solutions and self-hosted options. The only status page I found that I feel was simple enough, yet still capable of catering to many different monitoring needs is Statping. I have given this status page every opportunity to prove me wrong, but thus far every time I have tried to get it working, I have been dismayed to find out that either my website is taking 1561546884878 MS to load (what?!) or that the status page is completely broken because of its caching solution.

After being fully put out with the existing alternatives to self-hosting I have made my own status page/service monitoring solution that I hope will be simple enough that everyone can use, yet have the features that only complex solutions offer.

The backend runs on the latest versions of PHP (up to 7.4; 8.0 support is planned) and uses curl to contact services. I am also employing a simple built in caching system that exponentially increases the performance. There is no server-side rendering, and the way I developed this means that you could host the frontend and backend on different servers if need be. PHP is only responsible for providing an API and checking the status of the configured services.

Current Features:
- Live update of the frontend i.e. gets the most up to date service info at your configured interval.
- Configurable data downsampling/decimation on the charts (this is useful when you need to reduce the amount of data in a dataset before visualizing it without losing the visual characteristics of the data).
- Customizable color scheme for the frontend.
- Very modern and high performance UI.
- Simple and low resource usage backend.

Planned Features:
- A compact view mode for easy visibility of all services.
- An administration interface
    - The admin interface will allow you to configure services and manage your configured alerts.
- An alert system with different options: Slack, Discord, SMTP, SMS (Twilio), and others if needed.
- More service monitoring options; right now you can only monitor http(s) services, but I plan to add TCP/UDP, and ICMP.
- Ability to export and import monitoring data and configurations.
- A Docker container for easy deployment.

**Note that although I have wanted to do this for a while; I have only been working on the code for this project for a small amount of time. Although the basic functionality is here, it is by no means a true representation of the final quality of the project.**