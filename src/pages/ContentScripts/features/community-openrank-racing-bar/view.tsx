import optionsStorage, { HypercrxOptions, defaults } from '../../../../options-storage';
import RacingBar, { MediaControlers } from './RacingBar';
import { CommunityOpenRankDetails, getMonthlyData } from './data';
import { PlayerButton } from '../repo-activity-racing-bar/PlayerButton';
import { SpeedController } from '../repo-activity-racing-bar/SpeedController';

import React, { useState, useEffect, useRef } from 'react';
import { Space } from 'antd';
import { PlayCircleFilled, StepBackwardFilled, StepForwardFilled, PauseCircleFilled } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import '../../../../helpers/i18n';
interface Props {
  currentRepo: string;
  communityOpenRankDetails: CommunityOpenRankDetails;
}

const View = ({ currentRepo, communityOpenRankDetails }: Props): JSX.Element => {
  const [options, setOptions] = useState<HypercrxOptions>(defaults);
  const [speed, setSpeed] = useState<number>(1);
  const [playing, setPlaying] = useState<boolean>(false);
  const mediaControlersRef = useRef<MediaControlers>(null);
  const { t, i18n } = useTranslation();
  useEffect(() => {
    (async function () {
      setOptions(await optionsStorage.getAll());
      i18n.changeLanguage(options.locale);
    })();
  }, [options.locale]);

  return (
    <div>
      <div className="hypertrons-crx-border hypertrons-crx-container">
        <div className="hypertrons-crx-title">
          <span>{t('component_communityOpenRankRacingBar_title')}</span>
          <div className="hypertrons-crx-title-extra developer-tab">
            <Space>
              {/* speed control */}
              <SpeedController
                speed={speed}
                onSpeedChange={(speed) => {
                  setSpeed(speed);
                }}
              />

              {/* 3 buttons */}
              <Space size={3}>
                {/* last month | earliest month */}
                <PlayerButton
                  tooltip="Long press to the earliest"
                  icon={<StepBackwardFilled />}
                  onClick={mediaControlersRef.current?.previous}
                  onLongPress={mediaControlersRef.current?.earliest}
                />
                {/* play | pause */}
                <PlayerButton
                  icon={playing ? <PauseCircleFilled /> : <PlayCircleFilled />}
                  onClick={() => {
                    if (playing) {
                      mediaControlersRef.current?.pause();
                    } else {
                      mediaControlersRef.current?.play();
                    }
                  }}
                />
                {/* next month | latest month */}
                <PlayerButton
                  tooltip="Long press to the latest"
                  icon={<StepForwardFilled />}
                  onClick={mediaControlersRef.current?.next}
                  onLongPress={mediaControlersRef.current?.latest}
                />
              </Space>
            </Space>
          </div>
        </div>
        <div className="d-flex flex-wrap flex-items-center">
          <div className="col-12 col-md-8">
            <div style={{ margin: '10px 0 20px 20px' }}>
              <RacingBar
                ref={mediaControlersRef}
                speed={speed}
                data={getMonthlyData(communityOpenRankDetails)}
                setPlaying={setPlaying}
              />
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="color-text-secondary" style={{ marginLeft: '35px', marginRight: '35px' }}>
              <p>{t('component_communityOpenRankRacingBar_description')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default View;
