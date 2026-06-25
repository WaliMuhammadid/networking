import { LearningModule } from '../types';

export const LEARNING_CURRICULUM: LearningModule[] = [
  {
    id: 'basics',
    title: '1. Ports & Packet Routing in DevOps',
    subtitle: 'IP Address, Ports, and the "Port-Mapping" Mystery Solver',
    estimatedTime: '15 mins',
    description: 'Learn how servers send data, why applications listen on local ports, and why DevOps engineers maps them inside containerized environments.',
    concepts: [
      {
        title: '🔑 What is an IP Address and a Port?',
        text: 'Imagine a gigantic building. The IP Address is the street address of the building (e.g., "192.168.1.10"). Inside that building, there are thousands of rooms. These rooms are Ports (numbered from 1 to 65535). Applications lock themselves inside these rooms and listen for visitors!',
        bulletPoints: [
          'Port 80 is the default room for unencrypted HTTP (Web Traffic).',
          'Port 443 is the safe locked room for secure HTTPS.',
          'Port 22 is used for remote management via SSH (Secure Shell).',
          'Only one app can sit in one room/port at a exact moments. If App A sits in Port 80, App B will crash if you run it on Port 80!',
        ],
        diagramType: 'ports'
      },
      {
        title: '🌐 The DevOps Challenge: Port Conflict',
        text: 'In old times, deploying 3 Node.js web apps on the same hardware was painful because they all wanted Port 3000! DevOps solves this using Containers (Docker). Each container gets its own isolated network workspace with its own port rooms. Thus, you can run 10 containers inside the host, each running on port 3000 internally!',
      }
    ],
    devopsRelevance: {
      scenario: 'You are deploying a Node.js frontend on a host machine where port 80 is already busy, but we want users on the Internet to access our app using normal HTTP (which defaults to port 80). How do we solve it?',
      whyItMatters: 'We use Port Forwarding / Port Mapping! We tell our container runtime (like Docker) "Hey, map Port 8080 of our real machine to Port 3000 inside the container!". Now internal-external links are fully matched without any configuration conflict.',
      practicalTool: 'Docker Port Forwarding Flag: `-p <Host_Port>:<Container_Port>`',
      exampleCodeTitle: 'Running frontend with custom port mapping',
      exampleCode: `# Format: docker run -p <Host_Port>:<Container_Port> image-name
docker run -d -p 8080:3000 --name frontend-app nodejs-v1`,
      exampleCodeLanguage: 'bash'
    },
    quizzes: [
      {
        id: 'b1',
        question: 'If you run a container using "docker run -p 8080:3000 my-app", which port on your host machine will receive public requests?',
        options: [
          '3000',
          '8080',
          'Both ports simultaneously',
          'Port 80'
        ],
        correctIndex: 1,
        explanation: 'The format is always -p <Host_Port>:<Container_Port>. Thus, the host machine listens on port 8080 globally, and transparently routes that traffic to port 3000 inside the isolated container.'
      },
      {
        id: 'b2',
        question: 'Why does a DevOps developer get a "Port already in use" (EADDRINUSE) error?',
        options: [
          'The computer does not have an internet connection.',
          'There are way too many IP addresses configured.',
          'Another active program is already listening on that specific port number.',
          'The container lacks root permissions.'
        ],
        correctIndex: 2,
        explanation: 'Only one server process can bind to a specific IP address and port combination at any given time. If another app is listening there, the system blocks the new app with EADDRINUSE (Error Address Already In Use).'
      },
      {
        id: 'b3',
        question: 'Which of these is the default standard port for Secure Web Traffic (HTTPS)?',
        options: [
          '80',
          '22',
          '443',
          '3306'
        ],
        correctIndex: 2,
        explanation: 'Port 443 is universally designated for Secure Web Socket layers and HTTPS secure web traffic, while port 80 is for insecure plain HTTP.'
      }
    ],
    assignment: {
      id: 'a_basics',
      title: 'Docker Port Forwarding Configurator',
      description: 'Let us write a configuration line that maps incoming host traffic of our server.',
      instructions: 'You are deploying a Python backend listening on port 5000 inside its container. Your client wants to access it externally over standard secure-like port 8080 on the server. Write the port mapping expression expected in a docker run command (e.g. "-p <host>:<container>" or just the mapping string "<host>:<container>").',
      startingTemplate: '8080:',
      expectedValueDescription: 'Your mapping must map host port 8080 to container port 5000.',
      expectedPattern: /^(?:-p\s+)?8080:5000$/,
      hint: 'The format is always HOST_PORT:CONTAINER_PORT. We want 8080 on the host machine to point to 5000 inside the Python script.'
    }
  },
  {
    id: 'containers',
    title: '2. Container & Kubernetes Networking',
    subtitle: 'How Isolated Microservices Talk to Each Other Without Public IPs',
    estimatedTime: '20 mins',
    description: 'Understand internal container networks, virtual docker bridges, DNS resolution inside clusters, and how apps communicate secure and sound.',
    concepts: [
      {
        title: '🌉 The Docker Network Bridge',
        text: 'When we start containers, Docker automatically spins up a virtual switch inside your computer called a "Bridge Network" (usually named docker0). All containers ran together are plugged into this virtual switch, letting them talk to each other through safe, private, internal IP addresses (like "172.17.0.x").',
        bulletPoints: [
          'Containers on the exact same Docker bridge can talk to each other without opening ports to the external internet!',
          'Containers on different custom networks are completely isolated from each other. True security layer!',
          'DNS Service Discovery: You do not need to memorise raw container IPs! Docker handles built-in DNS that automatically matches a container name to its internal IP.',
        ],
        diagramType: 'bridge'
      },
      {
        title: '☸️ Scaling up: Kubernetes overlay networks',
        text: 'When you move from one machine (Docker) to multiple servers (Kubernetes Cluster), you need dynamic "Overlay Networks" (like Calico or Flannel) that route traffic cleanly across literal physical network cables.',
      }
    ],
    devopsRelevance: {
      scenario: 'You are deploying a Frontend container and a Postgres Database container. You want the Frontend to safely read database tables, but you DO NOT want the Database to be accessible by anyone on the public internet.',
      whyItMatters: 'Instead of opening port 5432 of Postgres to the whole world, you run both containers on a custom common private network. The Frontend accesses the database using the internal service name `db-service:5432`, retaining clean defense-in-depth security!',
      practicalTool: 'Docker Compose Custom Networks',
      exampleCodeTitle: 'Docker-compose private database networking',
      exampleCode: `version: '3.8'
services:
  web-app:
    image: node-web
    networks:
      - secure-app-net
  database:
    image: postgres-db
    # Notice: No "ports" defined for database! It stays private.
    networks:
      - secure-app-net

networks:
  secure-app-net:
    driver: bridge`,
      exampleCodeLanguage: 'yaml'
    },
    quizzes: [
      {
        id: 'c1',
        question: 'How do containers on the same Docker user-defined bridge network resolve each other’s physical internal IPs?',
        options: [
          'We must manually edit post-startup hosts files',
          'Through built-in Docker DNS service discovery, using container names as hostnames',
          'Containers can only talk to each other over external internet proxying',
          'They cannot talk under any condition'
        ],
        correctIndex: 1,
        explanation: 'Docker runs an internal DNS server for all user-defined bridge networks. Each container can query and resolve another container’s internal IP simply by pinging its friendly name (e.g. "ping database").'
      },
      {
        id: 'c2',
        question: 'Why is it a security vulnerability to publish database ports (e.g., "-p 5432:5432") on a public-facing web server?',
        options: [
          'It forces the database to run in slow mode.',
          'It exposes the internal SQL server port directly to raw internet scans, inviting brute force attacks.',
          'Docker bridge automatically turns off when database ports are published.',
          'Postgres does not allow public IPs.'
        ],
        correctIndex: 1,
        explanation: 'By publishing the DB port, you bypass private protection. Automated bots continuously scan public IP ranges on common ports (like 5432, 3306) to hack database tables.'
      }
    ],
    assignment: {
      id: 'a_containers',
      title: 'Connecting Services in Compose',
      description: 'Let us connect a web container to its database network using Docker Compose syntax.',
      instructions: 'Below is a partial configuration block. Complete the missing section. Your web application of name "web" needs to join a network named "frontend-db-link". Write the single key-value block inside services which specifies this linkage. Enter specifically the multiline YAML segment to join the network "frontend-db-link".',
      startingTemplate: `    networks:
      - `,
      expectedValueDescription: 'A yaml list mapping internal network linkages (- frontend-db-link)',
      expectedPattern: /network[s]?:\s*\n?\s*-\s*frontend-db-link/i,
      hint: 'Ensure that the list format has proper indentation and uses the spelling "frontend-db-link" with a hyphen in YAML structure.'
    }
  },
  {
    id: 'proxies',
    title: '3. Reverse Proxies & Load Balancers',
    subtitle: 'NginX, Traefik, Routing, and the Art of Distributing Traffic',
    estimatedTime: '25 mins',
    description: 'Learn how single access points distribute load across clusters, handle SSL certifications, and route user requests cleanly.',
    concepts: [
      {
        title: '🚥 What is a Reverse Proxy?',
        text: 'A forward proxy helps computers reach the outer web covertly. A REVERSE PROXY does the opposite: it stands between the outer web and your cluster. It receives all traffic, performs caching, terminates HTTPS (SSL certificates), and forwards requests internally based on paths!',
        bulletPoints: [
          'Path Routing: Requests like "/api" go to backend app, while "/" serves static files directly.',
          'Load Balancing: Distributes traffic evenly across 10 clones of your application to keep things fast.',
          'Secure Front: Hides container scale and layout from external hackers.',
        ],
        diagramType: 'proxy'
      }
    ],
    devopsRelevance: {
      scenario: 'You have written a server backend. Instead of letting users connect directly to Node, Python, or Go processes (which are terrible at raw memory load, static and TLS handling), you place Nginx as the front guard.',
      whyItMatters: 'We can configure Nginx to route all public queries. If the website gets thousands of hits at once, Nginx queues traffic, reads cached assets from disk instantly, and splits API hits to a healthy cluster cluster list.',
      practicalTool: 'Nginx Proxy configuration rule (`proxy_pass`)',
      exampleCodeTitle: 'Nginx reverse proxy basic configuration file',
      exampleCode: `server {
    listen 80;
    server_name mydevopsapp.com;

    location / {
        # Forward everything to internal Node container
        proxy_pass http://my-node-app:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}`,
      exampleCodeLanguage: 'nginx'
    },
    quizzes: [
      {
        id: 'p1',
        question: 'Which component typically intercepts inbound public internet requests first and delegates them to internal app replicas?',
        options: [
          'A forward proxy client',
          'A Reverse Proxy / Load Balancer',
          'The database driver connection pool',
          'The Docker storage driver volume config'
        ],
        correctIndex: 1,
        explanation: 'A Reverse Proxy acts as the gateway entryway, receiving requests first and proxying them outwards to our internal running container replicas.'
      },
      {
        id: 'p2',
        question: 'What is "SSL/TLS Termination" at the Load Balancer level?',
        options: [
          'Deleting TLS from the application code forever.',
          'Decoupling traffic so cryptography is handled at the load balancer gate, leaving internal traffic to move fast via HTTP without CPU overhead.',
          'Fixing a broken expired security key.',
          'Enforcing VPN-only access.'
        ],
        correctIndex: 1,
        explanation: 'By handling TLS/SSL encryption/decryption at the entry proxy/load balancer, you save duplicate CPU workload on all internal microservices and simplify certificate renewal.'
      }
    ],
    assignment: {
      id: 'a_proxies',
      title: 'Nginx proxy_pass Configuration rule',
      description: 'Configure an Nginx location block to forward user traffic.',
      instructions: 'Write the Nginx routing instruction that forwards inbound traffic inside a location block to the backend URL "http://api-service:8080". Use the exact directive keyword of Nginx.',
      startingTemplate: 'proxy_pass ',
      expectedValueDescription: 'Must be proxy_pass http://api-service:8080;',
      expectedPattern: /proxy_pass\s+http:\/\/api-service:8080\s*;/i,
      hint: 'Remember the semicolon ";" at the end of Nginx configuration statements!'
    }
  },
  {
    id: 'dns',
    title: '4. DNS & Service Discovery',
    subtitle: 'From human readable words like "app.com" to IP networks',
    estimatedTime: '15 mins',
    description: 'Learn how Domain Name Systems resolve destinations, DevOps DNS architectures, and how services automatically find new pods.',
    concepts: [
      {
        title: '📑 DNS Records to Remember for DevOps',
        text: 'A Domain Name System (DNS) is the phonebook of the internet. For configuring deployments, you will work with 3 core records types.',
        bulletPoints: [
          'A Record: Maps a hostname directly to an IPv4 Address (e.g. "mywebsite.com -> 123.45.67.89").',
          'CNAME Record: Maps a hostname to another hostname (e.g. "www.mywebsite.com -> mywebsite.com" or a custom domain to a Cloud Load Balancer address).',
          'TXT Record: Storage for plain text files (often used to verify domain ownership for tools like Let’s Encrypt HTTPS certificates or emails).',
        ],
        diagramType: 'dns-trace'
      }
    ],
    devopsRelevance: {
      scenario: 'You are moving your backend servers from AWS to Google Cloud. Your new VMs will get new IP addresses. Do your users need to change their apps? No, because of DNS record lookup mapping!',
      whyItMatters: 'If you configured your system with an A Record maps, you just update the DNS dashboard to point to the new IP. Within a few moments, traffic automatically gets routed to Google Cloud instances without the client knowing about the server switch!',
      practicalTool: 'Dig command (DNS diagnostics utilities)',
      exampleCodeTitle: 'Checking DNS propagation with terminal commands',
      exampleCode: `# Query nameservers for a domain A record
dig google.com A

# Or a simple query to trace DNS record resolution hops
dig +trace mydevopsacademy.com`,
      exampleCodeLanguage: 'bash'
    },
    quizzes: [
      {
        id: 'd1',
        question: 'Which DNS record type is utilized when you need to map a domain prefix name to a static IPv4 address?',
        options: [
          'CNAME Record',
          'TXT Record',
          'A Record',
          'MX Record'
        ],
        correctIndex: 2,
        explanation: 'An A record (Address Record) matches a public human-readable web domain directory directly into a 32-bit standard IPv4 physical interface IP.'
      },
      {
        id: 'd2',
        question: 'What is TTL (Time to Live) in DNS configuration settings?',
        options: [
          'The maximum time a cloud server can stay running.',
          'The amount of seconds a DNS resolver / browser is allowed to cache your DNS record details before checking again for changes.',
          'The ping delay response.',
          'The certificate expiry duration.'
        ],
        correctIndex: 1,
        explanation: 'Time To Live (TTL) tells ISPs and browsers how long to locally cache domain records. A shorter TTL (e.g., 60 seconds) is useful during cluster server migrations so traffic routes to the new destination instantly.'
      }
    ],
    assignment: {
      id: 'a_dns',
      title: 'Creating and assigning CNAME records',
      description: 'Define the canonical link mappings for your static blog domains.',
      instructions: 'Your DevOps blog is hosted using GitHub Pages at the url "user.github.io". Your student wants to access it through custom domain "blog.student.com". What DNS Record Type do you need to create to point "blog.student.com" to "user.github.io"? (Enter simply: A, CNAME, or TXT)',
      startingTemplate: '',
      expectedValueDescription: 'CNAME',
      expectedPattern: /^\s*CNAME\s*$/i,
      hint: 'When linking a domain to another domain string instead of a numerical IP address, you always use the Canonical Name record.'
    }
  },
  {
    id: 'security',
    title: '5. VPNs, Firewalls & Security Groups',
    subtitle: 'Building VPC (Virtual Private Cloud) Castles & Port Controls',
    estimatedTime: '20 mins',
    description: 'Learn how cloud architectures segment networks, how we isolate critical database components, and how security policies are configured.',
    concepts: [
      {
        title: '🏰 Isolation: Private Subnets and Security Groups',
        text: 'In the Cloud (AWS, GCP, Azure), you get your own sandbox called a Virtual Private Cloud (VPC). Within your VPC, you divide components into public zones (accessible by the Internet) and private zones (locked away). Security groups act as external security checkpoints checking both ingress (incoming) and egress (outgoing) ports.',
        bulletPoints: [
          'Databases should always reside in private subnet zones. No public traffic is admitted!',
          'Security Groups are stateful firewalls checking dynamic port numbers.',
          'Bastion Hosts/Jumpboxes: A secure pathway machine that DevOps uses to tunnel traffic safely via SSH into the secluded backend network.',
        ],
        diagramType: 'vpc-sg'
      }
    ],
    devopsRelevance: {
      scenario: 'You deploy a database server. It needs to accept queries from your application server, but if hackers can connect directly to it, they can run SQL injection or brute-force passwords.',
      whyItMatters: 'We set a Security Group firewall rule: "Reject all incoming traffic to database on port 3306, EXCEPT when the request enters from the Application Security Group". This secures database engines behind dynamic clouds.',
      practicalTool: 'AWS Security Group configuration block',
      exampleCodeTitle: 'Terraform representation of an ingress security rule',
      exampleCode: `# Allow ingress on port 80 (HTTP) to anywhere
ingress {
  from_port   = 80
  to_port     = 80
  protocol    = "tcp"
  cidr_blocks = ["0.0.0.0/0"] # The entire public internet universe
}`,
      exampleCodeLanguage: 'hcl'
    },
    quizzes: [
      {
        id: 's1',
        question: 'What is the absolute safest placement zone for a production SQL/MongoDB Database inside a Cloud VPC?',
        options: [
          'Within a public subnet with port 22 open to the public world.',
          'Inside a Private Subnet, with no public IP, reachable only via local internal subnet hops.',
          'Right alongside local edge CDN caches.',
          'On a public proxy host.'
        ],
        correctIndex: 1,
        explanation: 'Keeping DB servers entirely within Private subnets ensures they have absolutely no public entry addresses. Threat actors cannot scan or hit them directly.'
      },
      {
        id: 's2',
        question: 'What subnet notation allows "The entire public world of IPv4 addresses" in route tables and firewalls?',
        options: [
          '127.0.0.1/32',
          '192.168.0.0/16',
          '0.0.0.0/0',
          '10.0.0.0/24'
        ],
        correctIndex: 2,
        explanation: '0.0.0.0/0 specifies the entire IPv4 space with zero subnet mask limitations (no restricted bits), meaning "every machine anywhere on the Internet".'
      }
    ],
    assignment: {
      id: 'a_security',
      title: 'Configuring Firewalls CIDR Blocks',
      description: 'Write CIDR notation to specify traffic rules safely.',
      instructions: 'You want to allow internal traffic into your server, restricted specifically to developers originating from the internal private subnet range "10.0.0.x". The subnet uses a standard 24-bit subnet mask. Write the CIDR network block that covers IPs from "10.0.0.0" to "10.0.0.255".',
      startingTemplate: '10.0.0.0/',
      expectedValueDescription: '10.0.0.0/24',
      expectedPattern: /^\s*10\.0\.0\.0\/24\s*$/,
      hint: 'A standard subnet room range where the first 3 octets are locked uses a 24-bit mask designation.'
    }
  }
];
