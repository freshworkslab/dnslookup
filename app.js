const express = require('express');
const bodyParser = require('body-parser');
const whois = require('whois');
const dns = require('dns');

const app = express();
const PORT = 3000;

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// Serve the HTML form
app.get('/', (req, res) => {
res.send(`
       <form action="/lookup" method="POST">
           <label for="domain">Enter Domain Name:</label>
           <input type="text" id="domain" name="domain" required>
           <button type="submit">Fetch DNS Hosting Provider</button>
       </form>
   `);
});

// Route to handle form submission
app.post('/lookup', (req, res) => {
const domain = req.body.domain;

// Fetch name servers and registrar information
fetchNameServers(domain, (nameServers) => {
fetchRegistrar(domain, (registrar) => {
const hostingProviders = nameServers.map(ns => fetchHostingProvider(ns)).join('<br>');
res.send(`
               <h2>Domain: ${domain}</h2>
               <h3>Registrar:</h3>
               <p>${registrar}</p>
               <h3>Name Servers:</h3>
               <ul>
                   ${nameServers.map(ns => `<li>${ns}</li>`).join('')}
               </ul>
               <h3>DNS Hosting Providers:</h3>
               <p>${hostingProviders}</p>
               <a href="/">Go Back</a>
           `);
});
});
});

// Function to fetch name servers for the given domain
function fetchNameServers(domain, callback) {
dns.resolveNs(domain, (err, nameServers) => {
if (err) {
console.error(`Error fetching name servers for ${domain}:`, err);
callback([]);
return;
}
console.log(`Name Servers for ${domain}:`, nameServers);
callback(nameServers);
});
}

// Function to fetch registrar information for the given domain
function fetchRegistrar(domain, callback) {
whois.lookup(domain, (err, data) => {
if (err) {
console.error(`Error fetching WHOIS data for ${domain}:`, err);
callback('Unknown Registrar');
return;
}

console.log(`WHOIS data for ${domain}:`, data); // Log the entire WHOIS data

// Extract registrar information (handles variations like "Sponsoring Registrar")
const registrarMatch = data.match(/(?:Registrar|Sponsoring Registrar):\s*(.+)/i);
if (registrarMatch) {
callback(registrarMatch[1].trim());
} else {
callback('No registrar information found.');
}
});
}

// Function to fetch hosting provider based on the name server
function fetchHostingProvider(nameServer) {
    // Convert nameServer to lowercase for case-insensitive matching
    const ns = nameServer.toLowerCase();
    
    // Extended logic for hosting provider identification
    if (ns.includes('awsdns')) {
        return 'Amazon Web Services (AWS)';
    } else if (ns.includes('cloudflare')) {
        return 'Cloudflare';
    } else if (ns.includes('digitalocean')) {
        return 'DigitalOcean';
    } else if (ns.includes('domaincontrol')) {
        return 'GoDaddy';
    } else if (ns.includes('google')) {
        return 'Google Cloud DNS';
    } else if (ns.includes('bluehost')) {
        return 'Bluehost';
    } else if (ns.includes('hostgator')) {
        return 'HostGator';
    } else if (ns.includes('namecheap')) {
        return 'Namecheap';
    } else if (ns.includes('azure-dns')) {
        return 'Microsoft Azure';
    } else if (ns.includes('ovh')) {
        return 'OVH';
    } else if (ns.includes('linode')) {
        return 'Linode';
    } else if (ns.includes('dreamhost')) {
        return 'DreamHost';
    } else if (ns.includes('siteground')) {
        return 'SiteGround';
    } else if (ns.includes('wpengine')) {
        return 'WP Engine';
    } else if (ns.includes('1and1')) {
        return '1&1 IONOS';
    } else if (ns.includes('ionos')) {
        return '1&1 IONOS';
    } else if (ns.includes('hetzner')) {
        return 'Hetzner';
    } else if (ns.includes('vultr')) {
        return 'Vultr';
    } else if (ns.includes('fastly')) {
        return 'Fastly';
    } else if (ns.includes('netlify')) {
        return 'Netlify';
    } else if (ns.includes('vercel')) {
        return 'Vercel';
    } else if (ns.includes('rackspace')) {
        return 'Rackspace';
    } else if (ns.includes('akamai')) {
        return 'Akamai';
    } else if (ns.includes('pantheon')) {
        return 'Pantheon';
    } else if (ns.includes('liquidweb')) {
        return 'Liquid Web';
    } else if (ns.includes('cloudsigma')) {
        return 'CloudSigma';
    } else if (ns.includes('kinsta')) {
        return 'Kinsta';
    } else if (ns.includes('heroku')) {
        return 'Heroku';
    } else if (ns.includes('inmotionhosting')) {
        return 'InMotion Hosting';
    } else if (ns.includes('scaleway')) {
        return 'Scaleway';
    } else if (ns.includes('openstack')) {
        return 'OpenStack';
    } else if (ns.includes('lightsail')) {
        return 'Amazon Lightsail';
    } else if (ns.includes('backblaze')) {
        return 'Backblaze';
    } else if (ns.includes('dreamcompute')) {
        return 'DreamCompute';
    } else if (ns.includes('vps')) {
        return 'VPS Hosting (Various)';
    } else if (ns.includes('exoscale')) {
        return 'Exoscale';
    } else if (ns.includes('porkbun')) {
        return 'Porkbun';
    } else if (ns.includes('fleek')) {
        return 'Fleek';
    } else if (ns.includes('yahoo')) {
        return 'Yahoo.com';
    } else if (ns.includes('hostinger')) {
        return 'Hostinger';
    } else if (ns.includes('a2hosting')) {
        return 'A2 Hosting';
    } else if (ns.includes('fatcow')) {
        return 'FatCow';
    } else if (ns.includes('hostwinds')) {
        return 'Hostwinds';
    } else if (ns.includes('ipage')) {
        return 'iPage';
    } else if (ns.includes('greengeeks')) {
        return 'GreenGeeks';
    } else if (ns.includes('hostmonster')) {
        return 'HostMonster';
    } else if (ns.includes('justhost')) {
        return 'JustHost';
    } else if (ns.includes('webhostingpad')) {
        return 'Web Hosting Pad';
    } else if (ns.includes('interserver')) {
        return 'InterServer';
    } else if (ns.includes('hostpapa')) {
        return 'HostPapa';
    } else if (ns.includes('arvixe')) {
        return 'Arvixe';
    } else if (ns.includes('nixihost')) {
        return 'NixiHost';
    } else if (ns.includes('hawkhost')) {
        return 'HawkHost';
    } else if (ns.includes('mochahost')) {
        return 'MochaHost';
    } else if (ns.includes('tmdisp')) {
        return 'TMDHosting';
    } else if (ns.includes('fastcomet')) {
        return 'FastComet';
    } else if (ns.includes('nexcess')) {
        return 'Nexcess';
    } else if (ns.includes('skysilk')) {
        return 'SkySilk';
    } else if (ns.includes('kamatera')) {
        return 'Kamatera';
    } else if (ns.includes('cloudways')) {
        return 'Cloudways';
    } else if (ns.includes('renderhosting')) {
        return 'Render';
    } else if (ns.includes('flyio')) {
        return 'Fly.io';
    } else if (ns.includes('digitalocean-basic')) {
        return 'DigitalOcean Basic';
    } else if (ns.includes('upcloud')) {
        return 'UpCloud';
    } else if (ns.includes('serverpilot')) {
        return 'ServerPilot';
    } else if (ns.includes('runcloud')) {
        return 'RunCloud';
    } else if (ns.includes('gridpane')) {
        return 'GridPane';
    } else if (ns.includes('ploi')) {
        return 'Ploi';
    } else if (ns.includes('forge')) {
        return 'Laravel Forge';
    } else if (ns.includes('spinupwp')) {
        return 'SpinupWP';
    } else if (ns.includes('pagely')) {
        return 'Pagely';
    } else if (ns.includes('pressable')) {
        return 'Pressable';
    } else if (ns.includes('closte')) {
        return 'Closte';
    } else if (ns.includes('convesio')) {
        return 'Convesio';
    } else if (ns.includes('rocket')) {
        return 'Rocket.net';
    } else if (ns.includes('pressidium')) {
        return 'Pressidium';
    } else if (ns.includes('nestify')) {
        return 'Nestify';
    } else if (ns.includes('savvii')) {
        return 'Savvii';
    } else if (ns.includes('docksal')) {
        return 'Docksal';
    } else if (ns.includes('lando')) {
        return 'Lando';
    } else {
        return 'Unknown Provider';
    }
}

// Start the server
module.exports = app;
