import './globals.css';
import { LanguageProvider } from '../contexts/LanguageContext';
import { AuthProvider } from '../contexts/AuthContext';
import SiteHeader from '../components/SiteHeader';

export const metadata = {
  title: 'KisanLink',
  description: 'Smart Farmer Market & Price Discovery Platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <LanguageProvider>
            <SiteHeader />
            {children}
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
