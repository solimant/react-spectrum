/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import AlertMedium from '@spectrum-icons/ui/AlertMedium';
import {classNames, SlotProvider, useDOMRef, useStyleProps} from '@react-spectrum/utils';
import {DOMRef} from '@react-types/shared';
import {filterDOMProps} from '@react-aria/utils';
import {Grid} from '@react-spectrum/layout';
import InfoMedium from '@spectrum-icons/ui/InfoMedium';
// @ts-ignore
import intlMessages from '../intl/*.json';
import React from 'react';
import {SpectrumInlineAlertProps} from '@react-types/inlinealert';
import styles from '@adobe/spectrum-css-temp/components/inlinealert/vars.css';
import SuccessMedium from '@spectrum-icons/ui/SuccessMedium';
import {useLocalizedStringFormatter} from '@react-aria/i18n';
import {useProviderProps} from '@react-spectrum/provider';

let ICONS = {
  info: InfoMedium,
  positive: SuccessMedium,
  notice: AlertMedium,
  negative: AlertMedium
};

function InlineAlert(props: SpectrumInlineAlertProps, ref: DOMRef<HTMLDivElement>) {
  props = useProviderProps(props);
  let {
    children,
    variant = 'neutral',
    ...otherProps
  } = props;

  let {styleProps} = useStyleProps(otherProps);
  let domRef = useDOMRef(ref);

  let slots = {
    header: {UNSAFE_className: styles['spectrum-InLineAlert-header']},
    content: {UNSAFE_className: styles['spectrum-InLineAlert-content']}
  };

  let Icon = null;
  if (variant in ICONS) {
    Icon = ICONS[variant];
  }

  let stringFormatter = useLocalizedStringFormatter(intlMessages);
  let iconAlt = stringFormatter.format(variant);

  return (
    <div
      {...filterDOMProps(props)}
      {...styleProps}
      ref={domRef}
      className={classNames(styles, 'spectrum-InLineAlert',
        `spectrum-InLineAlert--${variant}`, styleProps.className)}
      role="alert">
      <Grid UNSAFE_className={styles['spectrum-InLineAlert-grid']}>
        <SlotProvider slots={slots}>
          {Icon && <Icon UNSAFE_className={styles['spectrum-InLineAlert-icon']} aria-label={iconAlt} />}
          {children}
        </SlotProvider>
      </Grid>
    </div>
  );
}

/**
 * In-line alerts display a non-modal message associated with objects in a view.
 * These are often used in form validation, providing a place to aggregate feedback related to multiple fields.
 */
const _InlineAlert = React.forwardRef(InlineAlert);
export {_InlineAlert as InlineAlert};