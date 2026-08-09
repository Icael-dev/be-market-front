import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

interface PageTitleProps {
  title: string;
  description?: string;
}

export function PageTitle({ title, description }: PageTitleProps) {
  const siteName = 'Be Market';
  const fullTitle = title ? `${title} | ${siteName}` : siteName;

  useEffect(() => {
    document.title = fullTitle;
  }, [fullTitle]);

  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
    </Helmet>
  );
}
