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

import {classNames, dimensionValue, useStyleProps} from '@react-spectrum/utils';
import {FocusRing} from '@react-aria/focus';
import React, {useRef} from 'react';
import {SpectrumAvatarProps} from '@react-types/avatar';
import styles from '@adobe/spectrum-css-temp/components/avatar/vars.css';
import {useAvatar} from '@react-aria/avatar';
import {useProviderProps} from '@react-spectrum/provider';

/**
 * An avatar is a thumbnail representation of an entity, such as a user or an organization.
 */
export function Avatar(props: SpectrumAvatarProps) {
  const {
    isDisabled,
    size = 'avatar-size-100',
    src,
    ...otherProps
  } = useProviderProps(props);

  const ref = useRef();

  const {avatarProps} = useAvatar(props, ref);
  const {alt, ...otherAvatarProps} = avatarProps;

  const {styleProps} = useStyleProps(otherProps);

  const sizeValue = size
    ? dimensionValue(size)
    : undefined;

  return (
    <FocusRing focusRingClass={classNames(styles, 'focus-ring')}>
      <img
        {...styleProps}
        {...otherAvatarProps}
        alt={alt}
        className={classNames(
          styles,
          'spectrum-Avatar',
          {
            'is-disabled': isDisabled
          },
          styleProps.className)}
        ref={ref}
        src={src}
        style={{
          ...styleProps.style,
          ...(sizeValue && {height: sizeValue, width: sizeValue})
        }} />
    </FocusRing>
  );
}
