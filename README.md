**Say Hi to Uptimon - A New Uptime Monitoring Solution**

**Screenshots**
![Some Online Services](https://github.com/RatherLogical/Uptimon/raw/master/images/screenshot_1.png)
![An Offline Service](https://github.com/RatherLogical/Uptimon/raw/master/images/screenshot_2.png)
![We Have Tooltips!](https://github.com/RatherLogical/Uptimon/raw/master/images/screenshot_3.png)

I have tried literally every status page out there; paid solutions and self-hosted options. The only status page I found that I feel was simple enough, yet still capable of catering to many different monitoring needs is Statping. I have given this status page every opportunity to prove me wrong, but thus far every time I have tried to get it working, I have been dismayed to find out that either my website is taking 1561546884878 MS to load (what?!) or that the status page is completely broken because of its caching solution.

After being fully put out with the existing alternatives to self-hosting I have made my own status page/service monitoring solution that I hope will be simple enough that everyone can use, yet have the features that only complex solutions offer.

The backend runs on the latest versions of PHP (up to 7.4; 8.0 support is planned) and uses curl to contact services. I am also employing a simple built in caching system that exponentially increases the performance. There is no server-side rendering, and the way I developed this means that you could host the frontend and backend on different servers if need be. PHP is only responsible for providing an API and checking the status of the configured services.

Planned Features:
- An administration interface
- The admin interface will allow you to configure services and manage
your configured alerts.
- An alert system with different options: Slack, Discord, SMTP, SMS
(Twilio), and others if needed. More service monitoring options;
right now you can only monitor http(s) services, but I plan to add
TCP/UDP, and ICMP.
- Ability to export and import monitoring data and configurations.

**Note that although I have wanted to do this for a while; I have only been working on the code for this project for the last two days. While the basic functionality is here, it is by no means a true representation of the final quality of the project.**