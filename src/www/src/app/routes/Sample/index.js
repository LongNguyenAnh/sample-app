/** @jsx jsx */
import { useEffect, useState } from 'react';
import { jsx, css } from "@emotion/react";
import { useQuery } from '@apollo/client';
import queryString from 'query-string';
import sanitize from '../../../utils/getRoute/sanitize';
import useCompareData from '../../../utils/useCompareProductsData';
import schemaFormatter from '../../../utils/schemaFormatter';
import { LazyLoadProvider } from '../../../utils/lazyloadStore';
import { withApollo } from '@apollo/client/react/hoc';
import getProductType from '../../../utils/getProductType';

//sample sections
import PageLayout from '../../components/page/basePage';

// shared components

// ie css fixes

export default compose(
  withApollo,
)((props) => {
  const {
    routeName,
    match,
    history,
  } = props;
  const { loading: globalZipLoading, globalZipInfo } = useGlobalZipcode({ withCity: true, ssr: true });
  const { zip: zipcode, isMajorMarket } = globalZipInfo || {};

  const {
    pricetype,
    bodystyle,
    intent,
  } = queryString.parse(history.location.search) || {};

  const { data, loading, error } = useQuery(samplePageQuery, {
    variables: {
      year: isMM ? "" : year,
      search: queryString.stringify(queryString.parse(history.location.search))
    },
    skip: globalZipLoading,
    ssr: true
  });

  const { data: expertReviewsData, loading: expertReviewsLoading, } = useQuery(reviewsQuery, {
    skip: !data?.info?.product?.id || loading,
    variables: { productId: data?.info?.product?.id },
    ssr: true
  });


  const seoParams = JSON.stringify({
    intent: data?.info?.intent,
    isExpedited: data?.info?.isExpedited,
    year: year
  });

  const { loading: seoLoading, seoMetadata } = useSeoMetadata({
    variables: {
      boundedContext: 'sample',
      id: 'sample_page',
      canonicalUrl: `https://www.domain.com${history.location.pathname}`,
      params: seoParams
    },
    // We need to know intent so wait until the sample Page Query is done before running this
    skip: loading || !data?.info?.intent,
    ssr: true
  });

  const { data: faqData } = useQuery(faqsQuery, {
    //These null variables below need to be filled when their values are available
    variables: {
      consumerRating: data?.consumerratings?.averageOverallRating,
      reliabilityRating: data?.safetyRatings?.overallRating?.value,
      category: data?.categories ? data?.categories.length > 1 ? 'product' : data?.categories[0] : null,
    },
    skip: loading || expertReviewsLoading || !data?.info?.model?.name,
    ssr: true
  });


  if (loading || seoLoading || expertReviewsLoading || globalZipLoading) {
    return <LoadingPage />;
  }

  if (error) {
    return <RedirectTo404 error={error} />
  }

  return (
    <StaticStoreContext.Provider value={getsampleStaticStoreData({ data, match, hasUrlBodyStyle: !!bodystyle })}>
      <LazyLoadProvider>
        <PageAdsProvider pageId={data?.info?.productClass === PRODUCT_CLASS.Used ? 'sampleUsed' : 'sampleNew'}>
          <PageBase
            {...props}
            data={data}
            seoMetadata={seoMetadata}
            expertReviewsData={expertReviewsData?.reviews}
            faqData={faqData}
          />
        </PageAdsProvider>
      </LazyLoadProvider>
    </StaticStoreContext.Provider>
  );
});

export const PageBase = (props) => {

  const {
    match,
    data,
    expertReviewsData: {
      expertReview,
      generatedReview
    } = {},
    routeName,
    seoMetadata: {
      title,
      description,
      h1,
      schemaOrg
    } = {},
    history,
    urlQueryString = queryString.parse(history.location.search) || {},
    deviceData,
    res,
    testMode,
    isDesktop,
  } = props;
  const {
    name,
    year,
    info,
    consumerratings: consumerRatings,
    videos,
    photos,
    merchandisedMedia,
    years,
    categories,
    productSpecs,
    alsoViewed,
  } = data || {};
  const zipcodeLocation = useZipcode({ withCity: true, ssr: true });
  const isNotSmartphone = deviceData?.device && !deviceData.issmartphone;
  const isSmartPhone = deviceData?.device && deviceData.issmartphone;
  const imageObjectUrl = Array.isArray(photos) && photos[0]?.url;
  const expertReviewUpdate = { ...expertReview, imagePath: info?.imagePath != null ? info?.imagePath : imageObjectUrl };

  const {
    formattedTitle,
    formattedMata,
    formattedH1,
    formattedSchema
  } = schemaFormatter({
    title,
    description,
    h1,
    schemaOrg,
    displayModel,
    name: name,
    year: yearid,
    info,
    expertreviews: expertReviewUpdate,
    consumerratings: consumerRatings,
    imageObjectUrl: imageObjectUrl
  });

  const page = {
    deviceData,
    year: year && year.id,
    name: name,
    title: formattedTitle || `${yearid} ${name} ${displayModel} Pricing, Reviews & Ratings | Sample App`,
    metaDescription: formattedMata || `Learn more about the ${yearid} ${name}. See the ${yearid} ${name} price range, expert review and consumer reviews near you.`,
    schemaOrg: formattedSchema,
    canonical: `https://www.domain.com/${sanitize(name)}/${year && year.id ? yearid + '/' : ''}`,
    header: formattedH1 || `${info && info.productClass && (info.productClass === PRODUCT_CLASS.Used ? 'Used' : '')} ${yearid} ${name}`,
    subheader: 'test',
    seoBreadcrumbs: true,
    breadcrumbs: info ? [
      {
        text: 'Home',
        href: '/',
        seoName: 'Home',
        seohref: `/`,
      },
      {
        text: `${name}`,
        href: `/${category}/`,
        seoName: `${name}`,
        seohref: `/${category}/`,
      }
    ] 
    : 
    [
      {
        text: 'Home',
        href: '/',
        seoName: 'Home',
        seohref: `/`,
      },
      {
        text: `${name}`,
        href: `/${category}/`,
        seoName: `${name}`,
        seohref: `/${category}/`,
      }
    ]
  };

  const analyticsAdditionalParams = {
    detailpagename: analytics.detailpagename ? analytics.detailpagename : '',
    zipcode,
  };
  
  const consumerratings = consumerRatings && {
    ...consumerRatings,
    intent: info && info.productClass,
  };
  const isMM = routeName === 'sample';
  const intent = info?.productClass;

  const referrer = getReferrer();
  const ertest = urlQueryString.ertest;
  const productData = {
    condition: info?.productClass == PRODUCT_CLASS.Used ? "used" : "new",
    year: info?.yearid.toString()
  }
  
  useSectionViews({
    offset: 25,
    sectionData: info ? sectionViewssample(info.productClass, info.pricingreporttype) : sectionViewssample(),
  });

  useAnalyticsSectionViews({
    offset: 25,
    sectionData: sampleSectionGAData
  });

  const {
    privacypolicy,
    specsModal
  } = section && getSectionsData({ section }) || {};


  useEffect(() => {
    if (typeof window !== 'undefined' && section) {
      anchorSectionHandler({ section, deviceData });
    }
  }, []);

  const [totalReviews, setTotalReviews] = useState(0);

  const sectionColors = sectionColorAlternator({
    isDataAvailable,
    visualOrdering,
    alwaysShow,
    skipAlternatingOn,
    startOnWhite
  });

  const featureSectionSpacing = {
    top: !isDataAvailable[photovideos] ? '0px' : '',
    bottom: isDataAvailable[specs] ? '0px' : '',
  }

  let featureMinHeight = '';
  if (isDataAvailable[photovideos]) {
    if (deviceData && deviceData.issmartphone) {
      featureMinHeight = '350px';
    } else {
      featureMinHeight = '298px';
    }
  } else {
    if (deviceData && deviceData.issmartphone) {
      featureMinHeight = '310px';
    } else {
      featureMinHeight = '258px';
    }
  }

  let subnavData = mapping.filter(({ section }) => section === expertReview || isDataAvailable[section]);
  if (isTrimsAboveExpertReview) {
    const style = subnavData.find(item => item.name === "Styles");
    subnavData = subnavData.filter(item => item.name !== "Styles");
    subnavData.unshift(style);
  }

  return (
    <SampleRouteChecker {...page} info={info} match={match} res={res} history={history} from={history.location.pathname}>
      <PageLayout id='samplePage'
        {...page}
        expertreviews={expertReview}
        match={match}
        history={history}
        deviceData={deviceData}
        testMode={testMode}
        info={info}
        isDesktop={isDesktop}
        seoBreadcrumbs={page.seoBreadcrumbs}
        breadcrumbs={page.breadcrumbs}
        hideCityScape={true}
        breadcrumbMarginTop={size.lg}
        breadcrumbFaderColor={colors.primary.white}
      >

        <Overview
          info={info}
          isDesktop={isDesktop}
          years={years}
          categories={categories}
          consumerRatings={consumerratings}
          expertReviews={expertReview}
          history={history}
          deviceData={deviceData}
          match={match}
          zipcodeLocation={zipcodeLocation}
          hasAssets={(photos && photos.length > 0) || (videos && videos.length > 0)}
        />

        {isTrimsAboveExpertReview &&
          <Section fullWidth bgColor={sectionColors[1]} data-cypress="challenger">
            <GridContainer gap="xl">
              <div id='expertreview'>
                <div data-automation='exprev' data-analytics='exprev' data-analytics-type='sectionview'>
                  <ExpertReviews
                    expertReviewsDataExists={isDataAvailable[expertreview]}
                    expertreviews={expertReview}
                    totalReviews={totalReviews}
                    videos={videos}
                    {...page}
                    testMode={testMode}
                    match={match}
                    history={history}
                    omniture={analytics}
                    productClass={info && info.productClass}
                    flippers={flippers}
                    deviceData={deviceData}
                    issample={true}
                    priceType={priceType}
                    generatedReview={generatedReview}
                    zipcode={zipcode}
                  />
                </div>
              </div>
            </GridContainer>
          </Section>
        }

        {!isTrimsAboveExpertReview &&
          <div id='expertreview' data-cypress="control">
            <Section data-automation='exprev' data-analytics='exprev' data-analytics-type='sectionview' fullWidth bgColor={sectionColors[1]} >
              <ExpertReviews
                expertReviewsDataExists={isDataAvailable[expertreview]}
                expertreviews={expertReview}
                totalReviews={totalReviews}
                videos={videos}
                {...page}
                testMode={testMode}
                match={match}
                history={history}
                omniture={analytics}
                productClass={info && info.productClass}
                flippers={flippers}
                deviceData={deviceData}
                issample={true}
                priceType={priceType}
                generatedReview={generatedReview}
                zipcode={zipcode}
              />
            </Section>

          </div>
        }

        <Section id='consumerreview' fullWidth bgColor={sectionColors[3]}>
          <FlexBox verticalSpacing={info?.productClass === PRODUCT_CLASS.Used ? 'xl' : 'none'} flowColumn>
            <ConsumerReviews
              expertReviewsDataExists={isDataAvailable[expertreview]}
              match={match}
              setTotalReviews={setTotalReviews}
              consumerratings={consumerratings}
              priceType={priceType}
              deviceData={deviceData}
              history={history}
              bgColor={sectionColors[3]}
              zipcode={zipcode}
            />
          </FlexBox>
        </Section>

        {fromManufacturerTab ?
          <FromManufacturer
            tabbedData={fromManufacturerTab}
            backgroundColor={sectionColors[4]}
            deviceData={deviceData}
            omniture={analytics}
            isCPO={intent == 'buy-used' && info.cpoDefaultPrice != 0}
            issample={true}
            priceType={priceType}
            bodyStyle={info?.bodyStyle}
            zipcode={zipcode}
          />
          : null}

        {info?.productClass === PRODUCT_CLASS.New
          ? <Section fullWidth verticalSpacingOverrides={{ top: '0px', bottom: '0px' }} bgColor={sectionColors[5]}>
            <ProductsForSale
              bgColor={sectionColors[5]}
              location={zipcodeLocation}
              omniture={analytics}
              addSectionSpacing
              isDesktop={isDesktop}
              enableCircuitBreaker={enableCircuitBreaker}
              enableLogging={enableLogging}
              deviceData={deviceData}
            />
          </Section>
          : ''
        }

        {isDataAvailable[compareproducts] &&
          <Section id="compareproducts" fullWidth bgColor={sectionColors[6]} data-analytics='compare' data-analytics-type='sectionview'>
            <CompareProducts
              deviceData={deviceData}
              tableData={compareTableData}
              fyctoData={fyctoData}
              bgColor={sectionColors[6]}
              dropId={dropId}
              issamplet={false}
            />
          </Section>
        }

        <CLSRankingsSection
          bgColor={sectionColors[10]}
          isRankingDataAvailable={isDataAvailable[rankingsection]}
          rankings={rankings}
          intent={intent}
          info={info}
          deviceData={deviceData}
          issample={true}
          priceType={priceType}
          zipcode={zipcode}
        />

        {(isDataAvailable[alsoviewed]) &&
          <Section fullWidth bgColor={sectionColors[11]}>
            <GridContainer gap='xl'>
              {isDataAvailable[alsoviewed] &&
                <AlsoViewed
                  data={alsoViewed.products}
                  deviceData={deviceData}
                  bgColor={sectionColors[12]}
                  issample={true}
                  priceTypeValue={priceType}
                  zipcode={zipcode}
                />
              }

            </GridContainer>
          </Section>
        }

        {isDataAvailable[latestnews] &&
          <Section fullWidth bgColor={sectionColors[12]}>
            <MoreInformation data={latestNews} />
          </Section>
        }

        {expertReview?.faqs && expertReview?.faqs.length > 0 ? ( //check and below
          <Section fullWidth bgColor={sectionColors[12]}>
            <Faqs faqs={expertReview.faqs} faqsHeader={expertReview.faqsHeader} /> 
          </Section>
        ) : info?.productClass === 'Used' && faqs && faqs.length > 0 && (
          <Section fullWidth bgColor={sectionColors[12]}>
            <Faqs faqs={faqs} />
          </Section>
        )}

        {(otherProducts && otherProducts.length > 0) &&
          <Section fullWidth bgColor={sectionColors[13]} data-cypress="other-years">
            <GridContainer gap='xl'>
              {otherProducts &&
                <OtherProducts
                  otherProducts={otherProducts}
                  testMode={testMode}
                />
              }
            </GridContainer>
          </Section>
        }

        <MediaShowcaseOverlay
          showOverlay={showMediaShowcaseOverlay}
          onClose={closeMediaShowcaseOverlay}
          deviceData={deviceData}
          mediaDataSets={mediaShowcaseOverlayData}
          openTabName={mediaShowcaseOverlayOpenTab}
          openSlideIndex={mediaShowcaseOverlayOpenSlide}
          zipcode={zipcode}
          issample={true}
          ctaHref={sampleGalleryCtaHref}
        />
        
      </PageLayout>
    </SampleRouteChecker>
  );
};