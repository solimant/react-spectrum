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

import React from 'react';
import {render, screen} from '@testing-library/react';
import {renderHook} from '@testing-library/react-hooks';
import {useAvatar} from '../';
import userEvent from '@testing-library/user-event';

describe('useAvatar', () => {
  const renderAvatarHook = (props) => renderHook(() => useAvatar(props)).result.current;

  it('handles defaults', () => {
    const {avatarProps} = renderAvatarHook({src: 'http://localhost/some_image.png'});
    expect(avatarProps.alt).toBe('');
    expect(avatarProps['aria-label']).toBeUndefined();
    expect(avatarProps['role']).toBeUndefined();
    expect(avatarProps.tabIndex).toBe(0);
  });

  it('handles custom element type', () => {
    const {avatarProps} = renderAvatarHook({elementType: 'div', src: 'http://localhost/some_image.png'});
    expect(avatarProps.alt).toBeUndefined();
    expect(avatarProps['aria-label']).toBe('');
    expect(avatarProps['role']).toBe('img');
    expect(avatarProps.tabIndex).toBe(0);
  });

  describe('when in use', () => {
    const ExampleAvatar = (props) => {
      const {avatarProps} = useAvatar({src: 'http://localhost/some_image.png', ...props});

      // eslint-disable-next-line jsx-a11y/alt-text
      return (<img {...avatarProps} />);
    };

    it('handles isDisabled = true', () => {
      const mockOnPress = jest.fn();

      render(<ExampleAvatar isDisabled onPress={mockOnPress} />);

      const avatarElem = screen.getByRole('img');
      expect(avatarElem).not.toHaveAttribute('tabIndex');

      userEvent.click(avatarElem);
      expect(mockOnPress).not.toHaveBeenCalled();
    });

    it('handles isDisabled = false', () => {
      const mockOnPress = jest.fn();

      render(<ExampleAvatar onPress={mockOnPress} />);

      const avatarElem = screen.getByRole('img');
      expect(avatarElem).toHaveAttribute('tabIndex', '0');

      userEvent.click(avatarElem);
      expect(mockOnPress).toHaveBeenCalled();
    });

    it('calls and warns when onClick is used', () => {
      const spyConsoleWarn = jest.spyOn(console, 'warn').mockImplementationOnce(jest.fn());

      const mockOnClick = jest.fn();
      render(<ExampleAvatar onClick={mockOnClick} />);

      const avatarElem = screen.getByRole('img');

      userEvent.click(avatarElem);
      expect(mockOnClick).toHaveBeenCalled();
      expect(spyConsoleWarn).toHaveBeenCalledWith(expect.stringMatching(/deprecated/i));
    });
  });
});
