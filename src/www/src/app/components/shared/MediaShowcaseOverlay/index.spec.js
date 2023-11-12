import '@testing-library/jest-dom';
import React from 'react';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';

import MediaShowcaseOverlayGallery from '.';
import useMediaShowcaseTransform from '../../../../utils/useMediaShowcaseTransform';

const info = {
  yearid: 2021,
  name: {
    name: 'abc'
  },
  productClass: 'New'
};

beforeEach(() => {
  useAnalytics.mockImplementation(() => {
    return {
      push: jest.fn(),
    };
  });
});

afterEach(cleanup);


describe('<MediaShowcaseOverlayGallery />', () => {
  test('Click next & previous button scroll gallery', async () => {
    const staticStore = {
      year: 2022,
      name: 'Abc',
      productClass: 'New',
    };
    const setShowOverlay = () => { };

    const { result } = renderHook(() => useMediaShowcaseTransform({ photos, videos, info, isDesktop: true, setShowOverlay }));
    const { mediaShowcaseOverlayData } = result.current;

    const mockRefeshAd = jest.fn();

    window.googletag = {
      pubads: jest.fn().mockReturnValue({
        refresh: mockRefeshAd,
        getSlots: jest.fn().mockReturnValue([])
      })
    };
    const mockTriggeredAnalyticsCall = jest.fn().mockImplementation((fn) => {
      return fn();
    });
    useAnalyticsClick.mockImplementation(() => {
      return {
        push: mockTriggeredAnalyticsCall
      }
    });
    render(
      <MediaShowcaseOverlayGallery
        showOverlay
        onClose={() => { }}
        deviceData={{
          issmartphone: false,
          istablet: false,
          isdesktop: true,
        }}
        mediaDataSets={mediaShowcaseOverlayData}
      />
    );

    const buttons = screen.getAllByRole('button', { hidden: true })
    fireEvent.click(buttons[4]);
    fireEvent.click(buttons[3 ]);
    //assert
    expect(mockTriggeredAnalyticsCall).toHaveBeenCalledTimes(2);
  });
});
