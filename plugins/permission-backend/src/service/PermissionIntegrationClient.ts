/*
 * Copyright 2021 The Backstage Authors
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

import fetch from 'node-fetch';
import { PluginEndpointDiscovery } from '@backstage/backend-common';
import {
  isDefinitiveAuthorizeResponse,
  validateAuthorizeResponse,
} from '@backstage/plugin-permission-common';
import {
  ApplyConditionsRequestEntry,
  ApplyConditionsResponseEntry,
  ConditionalPolicyDecision,
} from '@backstage/plugin-permission-node';

export type ResourcePolicyDecision = ConditionalPolicyDecision & {
  resourceRef: string;
};

export class PermissionIntegrationClient {
  private readonly discovery: PluginEndpointDiscovery;

  constructor(options: { discovery: PluginEndpointDiscovery }) {
    this.discovery = options.discovery;
  }

  async applyConditions(
    pluginId: string,
    decisions: readonly ApplyConditionsRequestEntry[],
    authHeader?: string,
  ): Promise<ApplyConditionsResponseEntry[]> {
    const endpoint = `${await this.discovery.getBaseUrl(
      pluginId,
    )}/.well-known/backstage/permissions/apply-conditions`;

    const response = await fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify({
        items: decisions.map(
          ({ id, resourceRef, resourceType, conditions }) => ({
            id,
            resourceRef,
            resourceType,
            conditions,
          }),
        ),
      }),
      headers: {
        ...(authHeader ? { authorization: authHeader } : {}),
        'content-type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(
        `Unexpected response from plugin upstream when applying conditions. Expected 200 but got ${response.status} - ${response.statusText}`,
      );
    }

    const authorizeResponse = validateAuthorizeResponse(await response.json());

    if (!isDefinitiveAuthorizeResponse(authorizeResponse)) {
      throw new Error(
        'Unexpected response from plugin upstream when applying conditions.',
      );
    }

    return authorizeResponse.items;
  }
}
