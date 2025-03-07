/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    images: {
        domains: ["localhost"], // Ajoute les domaines autorisés si les images viennent d'un serveur
        unoptimized: true, // Autorise l'affichage d'images locales
    },
};

module.exports = nextConfig;
