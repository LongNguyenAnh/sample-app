import React, { useEffect, useRef, useContext } from 'react';
import styled from '@emotion/styled';
import { useStaticStore } from '../../../../utils/staticStore';
import getProductType from '../../../../utils/getProductType';
import { BASE_URL } from '../../../constants';

const MediaShowcaseOverlayGallery = ({
  showOverlay,
  onClose,
  deviceData,
  mediaDataSets,
  openTabName,
  openSlideIndex,
  zipcode,
  issample,
  ctaHref,
}) => {
  const isDesktop = deviceData && !deviceData.issmartphone && !deviceData.istablet;
  const refreshInstance = useRef(0);
  const tabs = ['All'];

  const {
    productClass,
    year,
    productId,
    price,
    chromeStyleId
  } = useStaticStore();

  mediaDataSets && mediaDataSets.forEach(mediaDataSet => {
    tabs.push(mediaDataSet.tabName);
  });

  const selectedTabIndex = tabs.indexOf(openTabName);
  const openTabIndex = selectedTabIndex >= 0 ? selectedTabIndex : 0;

  const analytics = useAnalytics();
  const arrayBox = useRef([]);

  const onTabSelected = () => {
    analytics.push(() => ({
      type: 'click',
      googleAnalytics: {
      }
    }));
    arrayBox.current = [];
  };

  const productType = getProductType(productClass);

  const onProductouselScroll = (direction) => {
    const stateArrow = direction > 0 ? 'next' : 'previous';
    const eventResult = direction ? `scroll::gallery::${stateArrow}` : 'tile::carousel';

    // pause video player when switching slides. need to find a better solution for this later
    if (typeof jwplayer !== 'undefined' && typeof jwplayer().pause === 'function') {
      jwplayer().pause();
    }
  };

  const onStateUpdateCallback = (slide) => {
    if (!arrayBox.current.includes(slide.currentSlide)) {
      arrayBox.current.push(slide.currentSlide);
    }

    // pause video player when switching slides. need to find a better solution for this later
    if (typeof jwplayer !== 'undefined' && typeof jwplayer().pause === 'function') {
      jwplayer().pause();
    }
  }

  useEffect(() => {
    if (showOverlay) {
      arrayBox.current = [0];
    }
  }, [showOverlay]);

  const isNew = productType === "new" ? true : false;
  const ctaButtonText = issample && isNew ? "See Pricing" : "See Products for Sale";
  const ctaButtonHref = ctaHref ? (ctaHref.includes(BASE_URL) ? ctaHref : BASE_URL + ctaHref) : '';
  const handleCTAButtonClick = () => {
    
  };

  return (
    <MediaShowcaseOverlay
      showOverlay={showOverlay}
      updateCorrelator={adManager.updateCorrelator}
      onClose={onClose}
      isDesktop={isDesktop}
      mediaDataSets={mediaDataSets}
      openTabIndex={openTabIndex}
      openSlideIndex={openSlideIndex}
      numElementsBetweenAds={3}
      includeAllTab
      onTabSelected={onTabSelected}
      onProductouselScroll={onProductouselScroll}
      onThumbnailScroll={onThumbnailScroll}
      onStateUpdateCallback={onStateUpdateCallback}
      leftNavDataTestId='scroll_gallery_previous'
      rightNavDataTestId='scroll_gallery_next'
      thumbnailClickTag='tile_carousel'
      allTabTag='tab'
      year={year}
      ctaButtonText={ctaButtonText}
      ctaHref={ctaButtonHref}
      onCTAButtonClick={handleCTAButtonClick}
    />
  );
};

MediaShowcaseOverlayGallery.displayName = 'MediaShowcaseOverlay';

export default MediaShowcaseOverlayGallery;
