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
            const hostingProviders = nameServers.map(ns => fetchHostingProvider(ns));
            res.json({
                domain,
                registrar,
                nameServers,
                hostingProviders
            });
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

        // Extract registrar information
        const registrarMatch = data.match(/Registrar:\s*(.+)/i);
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
    } else {
        return 'Unknown Provider';
    }
}

module.exports = app;
