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

import {ActionButton, defaultTheme, Provider, Text} from '@adobe/react-spectrum';
import algoliasearch from 'algoliasearch/lite';
import docsStyle from './docs.css';
import {Item, SearchAutocomplete, Section} from '@react-spectrum/autocomplete';
import {listen} from 'quicklink';
import React, {useEffect, useRef, useState} from 'react';
import ReactDOM from 'react-dom';
import ShowMenu from '@spectrum-icons/workflow/ShowMenu';
import {ThemeSwitcher} from './ThemeSwitcher';
import {watchModals} from '@react-aria/aria-modal-polyfill';

if (process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => listen());
}

window.addEventListener('load', () => watchModals());

let title = document.querySelector('h1');

// Size the title to fit the available space.
function updateTitleFontSize() {
  let fontSize = parseInt(window.getComputedStyle(title).fontSize, 10);

  // Constrain font size to 58px, or 10% of the window width, whichever is smaller.
  let maxFontSize = Math.min(58, Math.round(window.innerWidth * 0.1));
  if (fontSize > maxFontSize) {
    fontSize = maxFontSize;
    title.style.fontSize = maxFontSize + 'px';
  }

  // If the font size is less than the maximum font size,
  // increase the font size until it overflows.
  while (fontSize < maxFontSize && title.scrollWidth <= title.clientWidth) {
    fontSize++;
    title.style.fontSize = fontSize + 'px';
  }

  // Reduce the font size until it doesn't overflow.
  while (title.scrollWidth > title.clientWidth) {
    fontSize--;
    title.style.fontSize = fontSize + 'px';
  }
}

updateTitleFontSize();

// Use ResizeObserver where available to detect size changes not related to window resizing, e.g. font loading.
if (typeof ResizeObserver !== 'undefined') {
  let observer = new ResizeObserver(() => {
    // Avoid updating the layout during the resize event and creating circular notifications.
    requestAnimationFrame(updateTitleFontSize);
  });
  observer.observe(title);
} else {
  window.addEventListener('resize', updateTitleFontSize);
}

function Hamburger() {
  let [isPressed, setIsPressed] = useState(false);
  let hamburgerRef = useRef(null);
  let hamburgerButtonRef = useRef(null);

  let onPress = (event) => {
    let nav = document.querySelector('.' + docsStyle.nav);
    let main = document.querySelector('main');
    let themeSwitcher = event.target.parentElement.nextElementSibling;
    let themeSwitcherButton = themeSwitcher.querySelector('button');
    nav.classList.toggle(docsStyle.visible);

    if (nav.classList.contains(docsStyle.visible)) {
      setIsPressed(true);
      main.setAttribute('aria-hidden', 'true');
      themeSwitcher.setAttribute('aria-hidden', 'true');
      if (themeSwitcherButton) {
        themeSwitcherButton.tabIndex = -1;
      }
      nav.tabIndex = -1;
      nav.focus();
    } else {
      setIsPressed(false);
      main.removeAttribute('aria-hidden');
      themeSwitcher.removeAttribute('aria-hidden');
      if (themeSwitcherButton) {
        themeSwitcherButton.removeAttribute('tabindex');
      }
      nav.removeAttribute('tabindex');
    }
  };

  useEffect(() => {
    let mediaQueryList = window.matchMedia('(max-width: 1020px)');
    let nav = document.querySelector('.' + docsStyle.nav);
    let main = document.querySelector('main');
    let hamburgerButton = hamburgerButtonRef.current;
    let themeSwitcher = hamburgerRef.current.nextElementSibling;

    let removeVisible = (isNotResponsive = false) => {
      setIsPressed(false);

      if (nav.contains(document.activeElement) && !isNotResponsive) {
        hamburgerButton.focus();
      }

      nav.classList.remove(docsStyle.visible);
      main.removeAttribute('aria-hidden');
      themeSwitcher.removeAttribute('aria-hidden');
      let themeSwitcherButton = themeSwitcher.querySelector('button');
      if (themeSwitcherButton) {
        themeSwitcherButton.removeAttribute('tabindex');
      }
      nav.removeAttribute('tabindex');
    };

    /* collapse nav when underlying content is clicked */
    let onClick = () => removeVisible();

    /* collapse expanded nav when esc key is pressed */
    let onKeydownEsc = (event) => {
      if (event.keyCode === 27) {
        removeVisible();
      }
    };

    /* trap keyboard focus within expanded nav */
    let onKeydownTab = (event) => {
      if (event.keyCode === 9 && nav.classList.contains(docsStyle.visible)) {
        let tabbables = nav.querySelectorAll('button, a[href]');
        let first = tabbables[0];
        let last = tabbables[tabbables.length - 1];

        if (event.shiftKey && event.target === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && event.target === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    /* restore default behavior when responsive media query no longer matches */
    let mediaQueryTest = (event) => {
      if (!event.matches) {
        removeVisible(true);
      }
    };

    main.addEventListener('click', onClick);
    document.addEventListener('keydown', onKeydownEsc);
    nav.addEventListener('keydown', onKeydownTab);

    let useEventListener = typeof mediaQueryList.addEventListener === 'function';
    if (useEventListener) {
      mediaQueryList.addEventListener('change', mediaQueryTest);
    } else {
      mediaQueryList.addListener(mediaQueryTest);
    }

    return () => {
      main.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKeydownEsc);
      nav.removeEventListener('keydown', onKeydownTab);

      if (useEventListener) {
        mediaQueryList.removeEventListener('change', mediaQueryTest);
      } else {
        mediaQueryList.removeListener(mediaQueryTest);
      }
    };
  }, [setIsPressed, hamburgerRef, hamburgerButtonRef]);

  let hamburgerButtonLabel = `${isPressed ? 'Close' : 'Open'} navigation panel`;

  return (
    <div ref={hamburgerRef} className={docsStyle.hamburgerButton} title={hamburgerButtonLabel} role="presentation">
      <ActionButton ref={hamburgerButtonRef} onPress={onPress} aria-label={hamburgerButtonLabel} aria-pressed={isPressed ? isPressed : undefined}>
        <ShowMenu />
      </ActionButton>
    </div>
  );
}

function DocSearch() {
  const client = algoliasearch('1V1Q59JVTR', '44a7e2e7508ff185f25ac64c0a675f98');
  const searchIndex = client.initIndex('react-spectrum');
  const searchOptions = {
    highlightPreTag: `<mark class="${docsStyle.docSearchBoxMark}">`,
    highlightPostTag: '</mark>'
  };

  const [searchValue, setSearchValue] = useState('');
  const [predictions, setPredictions] = useState(null);
  const [suggestions, setSuggestions] = useState(null);

  let updatePredictions = ({hits}) => {
    setPredictions(hits);
    let sections = [];
    hits.forEach(prediction => {
      let hierarchy = prediction.hierarchy;
      let objectID = prediction.objectID;
      let lvl0 = hierarchy.lvl0;
      let section = sections.find(section => section.title === lvl0);
      if (!section) {
        section = {title: lvl0, items: []};
        sections.push(section);
      }
      let text = [];
      let textValue = [];
      for (let i = 1; i < 6; i++) {
        if (hierarchy[`lvl${i}`]) {
          text.push(prediction._highlightResult.hierarchy[`lvl${i}`].value);
          textValue.push(hierarchy[`lvl${i}`]);
        }
      }
      section.items.push(
        <Item key={objectID} textValue={textValue.join(' | ')}>
          <Text><span dangerouslySetInnerHTML={{__html: text.join(' | ')}} /></Text>
          {
            prediction.content &&
            <Text slot="description">
              <span dangerouslySetInnerHTML={{__html: prediction._snippetResult.content.value}} />
            </Text>
          }
        </Item>
      );
    });
    let suggestions = sections.map((section, index) => <Section key={`${index}-lvl0-${section.title}`} title={section.title}>{section.items}</Section>);
    setSuggestions(suggestions);
  };

  let onInputChange = (query) => {
    if (!query && predictions) {
      setPredictions(null);
      setSuggestions(null);
    }
    setSearchValue(query);
    searchIndex
      .search(
        query,
        searchOptions
      )
      .then(updatePredictions);
  };

  let onSubmit = (value, key) => {
    if (key) {
      let prediction = predictions.find(prediction => key === prediction.objectID);
      let url = prediction.url;
      if (
        url.includes('https://react-spectrum.adobe.com') &&
        !url.includes(window.location.host)) {
        url = url.replace('https://react-spectrum.adobe.com', window.location.origin);
      }
      window.location.href = url;
    }
  };

  return (
    <Provider theme={defaultTheme} role="search">
      <SearchAutocomplete
        aria-label="Search"
        placeholder="Search"
        UNSAFE_className={docsStyle.docSearchBox}
        id="algolia-doc-search"
        value={searchValue}
        onInputChange={onInputChange}
        onSubmit={onSubmit}>
        {suggestions}
      </SearchAutocomplete>
    </Provider>
  );
}

ReactDOM.render(<>
  <Hamburger />
  <DocSearch />
  <ThemeSwitcher />
</>, document.querySelector('.' + docsStyle.pageHeader));

document.addEventListener('mousedown', (e) => {
  // Prevent focusing on links to other pages with the mouse to avoid flash of focus ring during navigation.
  let link = e.target.closest('a');
  if (link && (link.host !== location.host || link.pathname !== location.pathname)) {
    e.preventDefault();
  }

  // Add mouse focus class to summary elements on mouse down to prevent native browser focus from showing.
  if (e.target.tagName === 'SUMMARY') {
    e.target.classList.add(docsStyle.mouseFocus);
  }
});

// Remove mouse focus class on blur of a summary element.
document.addEventListener('blur', (e) => {
  if (e.target.tagName === 'SUMMARY') {
    e.target.classList.remove(docsStyle.mouseFocus);
  }
}, true);

let sidebar = document.querySelector('.' + docsStyle.nav);
let lastSelectedItem = sessionStorage.getItem('sidebarSelectedItem');
let lastScrollPosition = sessionStorage.getItem('sidebarScrollPosition');

// If we have a recorded scroll position, and the last selected item is in the sidebar
// (e.g. we're in the same category), then restore the scroll position.
if (lastSelectedItem && lastScrollPosition && [...sidebar.querySelectorAll('a')].some(a => a.pathname === lastSelectedItem)) {
  sidebar.scrollTop = parseInt(lastScrollPosition, 10);
}

// Save scroll position of the sidebar when we're about to navigate
window.addEventListener('pagehide', () => {
  sessionStorage.setItem('sidebarSelectedItem', location.pathname);
  sessionStorage.setItem('sidebarScrollPosition', sidebar.scrollTop);
});

// Disable autoplay for videos when the prefers-reduced-motion media query is enabled.
function reducedMotionCheck(e) {
  let videos = document.querySelectorAll('video[autoplay]');
  if (e.matches) {
    for (let v of videos) {
      v.pause();
      v.controls = true;
      v.removeAttribute('tabindex');
      v.onclick = undefined;
      v.onkeydown = undefined;
    }
  } else {
    for (let v of videos) {
      let toggle = () => {
        if (v.paused) {
          v.play();
        } else {
          v.pause();
        }
      };
      if (v.paused) {
        v.play();
      }
      v.tabIndex = 0;
      v.controls = false;
      v.onclick = toggle;
      v.onkeydown = e => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          toggle();
        }
      };
    }
  }
}

let prefersReducedMotion = matchMedia('(prefers-reduced-motion)');
reducedMotionCheck(prefersReducedMotion);
prefersReducedMotion.addEventListener('change', reducedMotionCheck);
