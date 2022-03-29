/*
 * Copyright 2020 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react';

import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { DEFAULT_NAMESPACE, Entity } from '@backstage/catalog-model';

import { toLowerMaybe } from './helpers';
import { TechDocsReaderPage } from './plugin';
import { TechDocsReaderLayout } from './reader';

type EntityPageDocsProps = { entity: Entity };

export const EntityPageDocs = ({ entity }: EntityPageDocsProps) => {
  const config = useApi(configApiRef);

  const entityName = {
    namespace: toLowerMaybe(
      entity.metadata.namespace ?? DEFAULT_NAMESPACE,
      config,
    ),
    kind: toLowerMaybe(entity.kind, config),
    name: toLowerMaybe(entity.metadata.name, config),
  };

  return (
    <TechDocsReaderPage entityName={entityName}>
      <TechDocsReaderLayout hideHeader />
    </TechDocsReaderPage>
  );
};
