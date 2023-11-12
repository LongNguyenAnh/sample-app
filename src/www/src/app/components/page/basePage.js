import React from 'react';
import { useRouteMatch } from "react-router-dom";
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet-async';
import Schemasample from '../schemaorg/sample';
import fixedAdHeights from '../../constants/fixedAdHeight';

const EnhancedGlobalOverlayProvider = React.memo(GlobalOverlayProvider);

// move hardcoded outer params into object once endpoints are hooked up
const Page = ({
  deviceData,
  children,
  schemaOrg,
  breadcrumbs,
  seoBreadcrumbs,
  title,
  info,
  omniture,
  metaDescription,
  canonical,
  testMode,
  needsWants,
  expertreviews,
  headingContent,
  isConsumerReviews,
  isDesktop,
  nofollow,
  hideCityScape = false,
  breadcrumbMarginTop = null,
  breadcrumbMarginBottom = null,
  breadcrumbFaderColor = null,
}) => {

  const match = useRouteMatch();
  const isNotSmartphone = deviceData?.device && !deviceData.issmartphone;
  const isFromNeedsWants = needsWants && needsWants.index !== 0 ? true: false;
  const fixedAdHeight = deviceData && deviceData.issmartphone  ? fixedAdHeights.mma : fixedAdHeights.mainCenterAd;

  return (
    <>
      <EnhancedGlobalOverlayProvider 
        deviceData={deviceData} 
        adComponent={
          <Ad deviceData={deviceData} omniture={omniture}/>
        } 
      />

      <Helmet>
        <title>{title}</title>
        <link rel="canonical" href={canonical} />
        <meta name="description" content={metaDescription} />
        {nofollow ? (
          <meta name="robots" content="noindex,nofollow"></meta>
        ) : (
          ""
        )}
        <meta property="og:title" content={title} />
        <meta property="og:url" content={typeof window !== 'undefined' ? window.location.href : canonical} />
        <meta property="og:image" content={info?.sideFrontAngleCroppedNoLogoImagePath || productNoImage} />
        <meta property="og:type" content="article" />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:site_name" content="domain" />
        <script type='application/ld+json'>
          {`${Schemasample({...match}, info, breadcrumbs, {...expertreviews})}`}
        </script>
        {schemaOrg &&
          <script type="application/ld+json">
            {`${schemaOrg}`}
          </script>
        }
      </Helmet>

      {!hideCityScape && (<Helmet encodeSpecialCharacters={false}>
        <link
          rel='preload'
          as='image'
          href={CityScape2}
        />
      </Helmet>)}

      <BaseTemplate
        gridConfig={{
          sm: 12,
          md: 12,
          lg: 12,
          xl: 12,
          max: 12,
          smRail: 12,
          mdRail: 12,
          lgRail: 12,
          xlRail: 12,
          maxRail: 9
        }}
        doNotIncludeAdContainer
        cityscapeUrl={!hideCityScape ? CityScape2 : undefined}
        fontFace={ArgoFonts}
        hideOverflow={false}
        autoHideScroller={isDesktop ? false : true}
        breadcrumbMarginTop={breadcrumbMarginTop ?? size.lg}
        breadcrumbMarginBottom={breadcrumbMarginBottom ?? size.sm}
        breadcrumbFaderColor={breadcrumbFaderColor ?? colors.primary.white}
        breadcrumbItems={
          seoBreadcrumbs ? breadcrumbs.map(({ text, href }) => ({ name: text === 'null' ? 'Base style' : text, url: `${href}` }))
          : 
          []
        }
        isLeaderboard
        fixedAdHeight={fixedAdHeight}
      >
        {isFromNeedsWants && (
          <Section style={{ alignItems: 'baseline' }} fullWidth bgColor={colors.neutral.offWhite} verticalSpacingOverrides={{ top: '0', bottom: '0' }}>
            <Button
              href={needsWants.input}
              buttonType="text"
              backgroundIcon="white"
              text="Back to Search Results"
              data-automation={`results_${omniture && omniture.pagename}_back_lnk`}
              data-lean-auto={testMode ? 'resultsbackbtn' : null}
              iconPosition='left'
            >
              <LeftArrow color='darkBrightBlue' size='16' />
            </Button>
          </Section>
        )}

        {children}
      </BaseTemplate>
    </>
  );
};

Page.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Page;
