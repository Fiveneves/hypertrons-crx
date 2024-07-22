import React from 'react';
import { render, Container } from 'react-dom';
import $ from 'jquery';

import features from '../../../../feature-manager';
import isPerceptor from '../../../../helpers/is-perceptor';
import { getRepoName, isPublicRepoWithMeta, isRepoRoot } from '../../../../helpers/get-repo-info';
import { getOpenrank } from '../../../../api/community';
import { RepoMeta, metaStore } from '../../../../api/common';
import View from './view';
import './index.scss';

const featureId = features.getFeatureID(import.meta.url);
let repoName: string;
let openrank: any;
let meta: RepoMeta;

const getData = async () => {
  meta = (await metaStore.get(repoName)) as RepoMeta;
  const lastDataAvailableMonth = meta.updatedAt ? new Date(meta.updatedAt) : new Date();
  lastDataAvailableMonth.setDate(0);

  const newestMonth =
    lastDataAvailableMonth.getFullYear() + '-' + (lastDataAvailableMonth.getMonth() + 1).toString().padStart(2, '0');
  openrank = await getOpenrank(repoName, '2023-09');
};

const renderTo = (container: Container) => {
  render(<View repoName={repoName} openrank={openrank} meta={meta} />, container);
};

const init = async (): Promise<void> => {
  repoName = getRepoName();
  await getData();

  // create container
  const container = document.createElement('div');
  container.id = featureId;

  $('#hypercrx-perceptor-slot-community-openrank-network').append(container);
  renderTo(container);
};

const restore = async () => {
  // Clicking another repo link in one repo will trigger a turbo:visit,
  // so in a restoration visit we should be careful of the current repo.
  if (repoName !== getRepoName()) {
    repoName = getRepoName();
    await getData();
  }
  // rerender the chart or it will be empty
  renderTo($(`#${featureId}`)[0]);
};

features.add(featureId, {
  asLongAs: [isPerceptor, isPublicRepoWithMeta],
  awaitDomReady: true,
  init,
  restore,
});
