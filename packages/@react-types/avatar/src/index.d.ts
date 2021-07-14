/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {DimensionValue, DOMProps, PressEvents, StyleProps} from '@react-types/shared';

export interface AvatarProps extends PressEvents {
  /**
   * Text description of the avatar.
   *
   * @default null
   */
  alt?: string,
  /**
   * Whether the avatar is disabled.
   */
  isDisabled?: boolean,
  /**
   * The image URL for the avatar.
   */
  src: string
}

export interface AriaAvatarProps extends AvatarProps, DOMProps {
}

export interface SpectrumAvatarProps extends AriaAvatarProps, Omit<StyleProps, 'width' | 'height'> {
  /**
   * Size of the avatar. Affects both height and width.
   *
   * @default avatar-size-100
   */
  size?: DimensionValue
}
