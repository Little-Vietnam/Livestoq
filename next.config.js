/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'example.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.britannica.com',
      },
      {
        protocol: 'https',
        hostname: 'dygtyjqp7pi0m.cloudfront.net',
      },
      {
        protocol: 'https',
        hostname: 'www.woldswildlife.co.uk',
      },
      {
        protocol: 'https',
        hostname: 'media.4-paws.org',
      },
      {
        protocol: 'https',
        hostname: 'images.twinkl.co.uk',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

module.exports = nextConfig;
