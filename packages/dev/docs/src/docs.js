/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {attachToToC} from './attachToToC';
import {Breadcrumbs, Item} from '@react-spectrum/breadcrumbs';
import {Content, View} from '@react-spectrum/view';
import {Dialog, DialogTrigger} from '@react-spectrum/dialog';
import {Divider} from '@react-spectrum/divider';
import docsStyle from './docs.css';
import {focusWithoutScrolling} from '@react-aria/utils';
import highlightCss from './syntax-highlight.css';
import {Pressable} from '@react-aria/interactions';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import ReactDOM from 'react-dom';
import {ThemeProvider} from './ThemeSwitcher';

let links = document.querySelectorAll('a[data-link]');
for (let link of links) {
  if (link.closest('[hidden]')) {
    continue;
  }

  let container = document.createElement('span');

  ReactDOM.render(
    <ThemeProvider UNSAFE_className={docsStyle.inlineProvider}>
      <DialogTrigger type="popover">
        <Pressable>
          {/* eslint-disable jsx-a11y/click-events-have-key-events */}
          {/* eslint-disable jsx-a11y/anchor-is-valid */}
          <a role="link" tabIndex={0} aria-haspopup="dialog" data-link={link.dataset.link} className={link.className} onClick={e => e.preventDefault()}>{link.textContent}</a>
        </Pressable>
        <LinkPopover id={link.dataset.link} />
      </DialogTrigger>
    </ThemeProvider>
  , container);

  link.parentNode.replaceChild(container.firstElementChild, link);
}

function LinkPopover({id}) {
  let ref = useRef();
  let [breadcrumbs, setBreadcrumbs] = useState([document.getElementById(id)]);

  const onBlurCurrentBreadcrumb = useCallback((event) => {
    event.target.removeEventListener('blur', onBlurCurrentBreadcrumb);
    event.target.tabIndex = -1;
  },
  []);

  useEffect(() => {
    let isCancelled = false; 
    let timeoutId;
    let links = ref.current.querySelectorAll('[data-link]');
    for (let link of links) {
      link.removeAttribute('aria-haspopup');
      link.addEventListener('click', (e) => {
        e.preventDefault();
        setBreadcrumbs([...breadcrumbs, document.getElementById(link.dataset.link)]);
      });
    }

    if (isCancelled) {
      if (timeoutId) {
        cancelAnimationFrame(timeoutId);
      }
      return;
    }

    timeoutId = requestAnimationFrame(() => {
      const currentBreadcrumb = ref.current.closest(`.${docsStyle.popover}`).querySelector('[aria-current]');
      if (currentBreadcrumb) {
        currentBreadcrumb.tabIndex = 0;
        currentBreadcrumb.addEventListener('blur', onBlurCurrentBreadcrumb);
        focusWithoutScrolling(currentBreadcrumb); 
      }
    });

    return () => isCancelled = true;
  }, [breadcrumbs, onBlurCurrentBreadcrumb]);

  return (
    <Dialog UNSAFE_className={`${highlightCss.spectrum} ${docsStyle.popover}`} size="L">
      <View slot="heading">
        <Breadcrumbs onAction={(key) => setBreadcrumbs(breadcrumbs.slice(0, key))}>
          {breadcrumbs.map((b, i) => (
            <Item key={i + 1}>
              {b.dataset.title}
            </Item>
          ))}
        </Breadcrumbs>
      </View>
      <Divider size="M" />
      <Content>
        <div ref={ref} dangerouslySetInnerHTML={{__html: breadcrumbs[breadcrumbs.length -  1].innerHTML}} />
      </Content>
    </Dialog>
  );
}

attachToToC();
