// pages/index.js
import Head from 'next/head';
import Header from '../components/Header';
import PairingForm from '../components/PairingForm';
import Footer from '../components/Footer';

export default function Home() {
    return (
        <div className="min-h-screen bg-gray-100">
            <Head>
                <title>Phistar Bot Pairing</title>
                <meta name="description" content="Securely connect your WhatsApp account with Phistar Bot" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Header />
            <main className="container mx-auto py-10 px-4">
                <PairingForm />
            </main>
            <Footer />
        </div>
    );
}
