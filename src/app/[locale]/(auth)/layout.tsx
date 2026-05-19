import { ClerkProvider } from '@clerk/nextjs';
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/libs/I18nRouting';
import { ClerkLocalizations } from '@/utils/AppConfig';

export default async function AuthLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const clerkLocale =
    ClerkLocalizations.supportedLocales[locale] ?? ClerkLocalizations.defaultLocale;
  let signInUrl = '/sign-in';
  let dashboardUrl = '/dashboard';
  let afterSignOutUrl = '/';

  if (locale !== routing.defaultLocale) {
    signInUrl = `/${locale}${signInUrl}`;
    dashboardUrl = `/${locale}${dashboardUrl}`;
    afterSignOutUrl = `/${locale}${afterSignOutUrl}`;
  }

  return (
    <ClerkProvider
      appearance={{
        cssLayerName: 'clerk',
        variables: {
          colorPrimary: '#111111', // ink
          colorBackground: '#ffffff', // canvas
          colorInputBackground: '#f5f5f5', // soft-cloud
          colorText: '#111111', // ink
          borderRadius: '0px', // square cards & inputs
          fontFamily: 'var(--font-inter), system-ui, sans-serif',
        },
        elements: {
          card: 'shadow-none border border-hairline-soft rounded-none',
          formButtonPrimary: 'rounded-full bg-[#111] text-white hover:bg-[#333]',
          socialButtons: 'hidden',
          socialButtonsBlockButtonArrow: 'hidden',
          dividerRow: 'hidden',
          footer: 'hidden',
          footerAction: 'hidden',
        },
      }}
      localization={clerkLocale}
      signInUrl={signInUrl}
      signInFallbackRedirectUrl={dashboardUrl}
      afterSignOutUrl={afterSignOutUrl}
    >
      {props.children}
    </ClerkProvider>
  );
}
