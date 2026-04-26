import PropTypes from "prop-types";
import { Helmet } from "react-helmet-async";
import { forwardRef } from "react";
// @mui
import { Box } from "@mui/material";
import { buildCanonicalUrl, toAbsoluteUrl } from "../utils/seo";

// ----------------------------------------------------------------------

const DEFAULT_TITLE = "Sanghathi";
const DEFAULT_DESCRIPTION =
  "Sanghathi is a mentoring and student success platform for CMRIT, built to streamline collaboration for students, faculty, and admins.";

const Page = forwardRef(
  (
    {
      children,
      title = "",
      meta,
      description = DEFAULT_DESCRIPTION,
      canonicalPath = "/",
      image = "/logo.jpeg",
      type = "website",
      keywords = "",
      noIndex = false,
      structuredData,
      ...other
    },
    ref
  ) => {
    const fullTitle = title ? `${title} | ${DEFAULT_TITLE}` : DEFAULT_TITLE;
    const canonicalUrl = buildCanonicalUrl(canonicalPath);
    const imageUrl = toAbsoluteUrl(image);
    const jsonLdItems = Array.isArray(structuredData)
      ? structuredData
      : structuredData
        ? [structuredData]
        : [];

    return (
      <>
        <Helmet>
          <title>{fullTitle}</title>
          <meta name="description" content={description} />
          {keywords ? <meta name="keywords" content={keywords} /> : null}
          <meta
            name="robots"
            content={
              noIndex
                ? "noindex, nofollow"
                : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
            }
          />

          <link rel="canonical" href={canonicalUrl} />

          <meta property="og:site_name" content="Sanghathi" />
          <meta property="og:type" content={type} />
          <meta property="og:title" content={fullTitle} />
          <meta property="og:description" content={description} />
          <meta property="og:url" content={canonicalUrl} />
          <meta property="og:image" content={imageUrl} />

          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={fullTitle} />
          <meta name="twitter:description" content={description} />
          <meta name="twitter:image" content={imageUrl} />

          {jsonLdItems.map((item, index) => (
            <script key={`jsonld-${index}`} type="application/ld+json">
              {JSON.stringify(item)}
            </script>
          ))}

          {meta}
        </Helmet>

        <Box ref={ref} {...other}>
          {children}
        </Box>
      </>
    );
  }
);

Page.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  meta: PropTypes.node,
  description: PropTypes.string,
  canonicalPath: PropTypes.string,
  image: PropTypes.string,
  type: PropTypes.string,
  keywords: PropTypes.string,
  noIndex: PropTypes.bool,
  structuredData: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

export default Page;
