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
            const hostingProviders = nameServers.map(ns => {
                const providerInfo = fetchHostingProvider(ns);
                return `<a href="${providerInfo.helpLink}" target="_blank">${providerInfo.provider}</a>`;
            }).join('<br>');

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

// Function to fetch hosting provider based on the name server and return provider with a help link for adding CNAME records
function fetchHostingProvider(nameServer) {
    // Convert nameServer to lowercase for case-insensitive matching
    const ns = nameServer.toLowerCase();

    // Define a map of hosting providers to their CNAME record help documentation URLs
    const helpDocs = {
        'Amazon Web Services (AWS)': 'https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/resource-record-sets-creating.html#resource-record-sets-creating-cname',
        'Cloudflare': 'https://developers.cloudflare.com/dns/manage-dns-records/how-to/create-dns-records/',
        'DigitalOcean': 'https://docs.digitalocean.com/products/networking/dns/how-to/manage-records/#cname-record',
        'GoDaddy': 'https://www.godaddy.com/help/add-a-cname-record-19236',
        'Google Cloud DNS': 'https://cloud.google.com/dns/docs/records',
        'Bluehost': 'https://www.bluehost.com/help/article/dns-management-add-edit-or-delete-dns-entries#add',
        'HostGator': 'https://www.hostgator.com/help/article/how-do-i-create-cname-records',
        'Namecheap': 'https://www.namecheap.com/support/knowledgebase/article.aspx/9727/2237/how-do-i-set-up-a-cname-record-for-my-domain',
        'Microsoft Azure': 'https://learn.microsoft.com/en-us/azure/dns/dns-cname-records',
        'OVH': 'https://docs.ovh.com/gb/en/domains/web_hosting_how_to_edit_my_dns_zone/#cname-record',
        'Linode': 'https://www.linode.com/docs/guides/dns-records-an-introduction/#cname-records',
        'DreamHost': 'https://help.dreamhost.com/hc/en-us/articles/216031547-CNAME-records-overview',
        'SiteGround': 'https://www.siteground.com/kb/how_to_set_your_dns_records/#CNAME',
        'WP Engine': 'https://wpengine.com/support/dns/',
        '1&1 IONOS': 'https://www.ionos.com/help/domains/configuring-dns-records-for-your-domain/',
        'Hetzner': 'https://docs.hetzner.com/dns-console/general/dns-management/#create-cname-record',
        'Vultr': 'https://www.vultr.com/docs/how-to-manage-dns-records-in-vultr/#cname',
        'Fastly': 'https://developer.fastly.com/learning/concepts/dns/#cname',
        'Netlify': 'https://docs.netlify.com/domains-https/custom-domains/configure-external-dns/#configure-a-cname-record',
        'Vercel': 'https://vercel.com/docs/concepts/projects/domains/configure-a-domain#2.-add-the-cname-record',
        'Rackspace': 'https://support.rackspace.com/how-to/create-a-cname-record/',
        'Akamai': 'https://community.akamai.com/customers/s/article/DNS-Management-Overview?language=en_US',
        'Pantheon': 'https://pantheon.io/docs/dns',
        'Liquid Web': 'https://www.liquidweb.com/kb/manage-dns-records-in-cpanel/#cname-record',
        'Oracle Dyn': 'https://help.dyn.com/standard-dns-record-types/#CNAME',
        'Yahoo.com': 'https://help.smallbusiness.yahoo.net/s/article/SLN20581',
        'Porkbun': 'https://kb.porkbun.com/article/20-how-to-add-a-cname-record',
        'Fleek': 'https://docs.fleek.co/hosting/domain-management/#cname',
        // Add more providers and links as needed
    };

    // Extended logic for hosting provider identification
    if (ns.includes('awsdns')) {
        return { provider: 'Amazon Web Services (AWS)', helpLink: helpDocs['Amazon Web Services (AWS)'] };
    } else if (ns.includes('cloudflare')) {
        return { provider: 'Cloudflare', helpLink: helpDocs['Cloudflare'] };
    } else if (ns.includes('digitalocean')) {
        return { provider: 'DigitalOcean', helpLink: helpDocs['DigitalOcean'] };
    } else if (ns.includes('domaincontrol')) {
        return { provider: 'GoDaddy', helpLink: helpDocs['GoDaddy'] };
    } else if (ns.includes('google')) {
        return { provider: 'Google Cloud DNS', helpLink: helpDocs['Google Cloud DNS'] };
    } else if (ns.includes('bluehost')) {
        return { provider: 'Bluehost', helpLink: helpDocs['Bluehost'] };
    } else if (ns.includes('hostgator')) {
        return { provider: 'HostGator', helpLink: helpDocs['HostGator'] };
    } else if (ns.includes('namecheap')) {
        return { provider: 'Namecheap', helpLink: helpDocs['Namecheap'] };
    } else if (ns.includes('azure-dns')) {
        return { provider: 'Microsoft Azure', helpLink: helpDocs['Microsoft Azure'] };
    } else if (ns.includes('ovh')) {
        return { provider: 'OVH', helpLink: helpDocs['OVH'] };
    } else if (ns.includes('linode')) {
        return { provider: 'Linode', helpLink: helpDocs['Linode'] };
    } else if (ns.includes('dreamhost')) {
        return { provider: 'DreamHost', helpLink: helpDocs['DreamHost'] };
    } else if (ns.includes('siteground')) {
        return { provider: 'SiteGround', helpLink: helpDocs['SiteGround'] };
    } else if (ns.includes('wpengine')) {
        return { provider: 'WP Engine', helpLink: helpDocs['WP Engine'] };
    } else if (ns.includes('1and1') || ns.includes('ionos')) {
        return { provider: '1&1 IONOS', helpLink: helpDocs['1&1 IONOS'] };
    } else if (ns.includes('hetzner')) {
        return { provider: 'Hetzner', helpLink: helpDocs['Hetzner'] };
    } else if (ns.includes('vultr')) {
        return { provider: 'Vultr', helpLink: helpDocs['Vultr'] };
    } else if (ns.includes('fastly')) {
        return { provider: 'Fastly', helpLink: helpDocs['Fastly'] };
    } else if (ns.includes('netlify')) {
        return { provider: 'Netlify', helpLink: helpDocs['Netlify'] };
    } else if (ns.includes('vercel')) {
        return { provider: 'Vercel', helpLink: helpDocs['Vercel'] };
    } else if (ns.includes('rackspace')) {
        return { provider: 'Rackspace', helpLink: helpDocs['Rackspace'] };
    } else if (ns.includes('akamai')) {
        return { provider: 'Akamai', helpLink: helpDocs['Akamai'] };
    } else if (ns.includes('pantheon')) {
        return { provider: 'Pantheon', helpLink: helpDocs['Pantheon'] };
    } else if (ns.includes('liquidweb')) {
        return { provider: 'Liquid Web', helpLink: helpDocs['Liquid Web'] };
    } else if (ns.includes('dyn.com')) {
        return { provider: 'Oracle Dyn', helpLink: helpDocs['Oracle Dyn'] };
    } else if (ns.includes('yahoo')) {
        return { provider: 'Yahoo.com', helpLink: helpDocs['Yahoo.com'] };
    } else if (ns.includes('porkbun')) {
        return { provider: 'Porkbun', helpLink: helpDocs['Porkbun'] };
    } else if (ns.includes('fleek')) {
        return { provider: 'Fleek', helpLink: helpDocs['Fleek'] };
    } else {
        return { provider: 'Unknown Provider', helpLink: '#' }; // No help link for unknown providers
    }
}

// Start the server
module.exports = app;
