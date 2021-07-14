import {Avatar} from '../';
import React from 'react';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Avatar', () => {
  it('renders an avatar image', () => {
    render(<Avatar src="http://localhost/some_image.png" />);
    expect(screen.getByRole('img')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', 'http://localhost/some_image.png');
  });

  it('can render an avatar image with an alt', () => {
    render(<Avatar src="http://localhost/some_image.png" alt="Test avatar" />);
    expect(screen.getByAltText(/test avatar/i)).toBeInTheDocument();
  });

  it('can receive focus and show a focus ring', () => {
    render(<Avatar src="http://localhost/some_image.png" />);
    userEvent.tab();
    expect(screen.getByRole('img')).toHaveFocus();
    expect(screen.getByRole('img')).toHaveAttribute('class', expect.stringMatching(/focus/i));
  });

  it('supports custom sizes', () => {
    render(<Avatar src="http://localhost/some_image.png" size="80px" />);
    expect(screen.getByRole('img')).toHaveStyle({
      height: '80px',
      width: '80px'
    });
  });

  it('supports custom class names', () => {
    render(<Avatar src="http://localhost/some_image.png" UNSAFE_className="my-class" />);
    expect(screen.getByRole('img')).toHaveAttribute('class', expect.stringContaining('my-class'));
  });

  it('supports style props', () => {
    render(<Avatar src="http://localhost/some_image.png" isHidden />);
    expect(screen.getByRole('img', {hidden: true})).toBeInTheDocument();
  });

  it('supports custom DOM props', () => {
    render(<Avatar src="http://localhost/some_image.png" data-testid="Test avatar" />);
    expect(screen.getByTestId(/test avatar/i)).toBeInTheDocument();
  });

  describe('when isDisabled = true', () => {
    it('renders a disabled avatar image', () => {
      render(<Avatar src="http://localhost/some_image.png" isDisabled />);
      expect(screen.getByRole('img')).toHaveAttribute('class', expect.stringMatching(/disabled/i));
    });

    it('cannot receive focus or show a focus ring', () => {
      render(<Avatar src="http://localhost/some_image.png" isDisabled />);
      userEvent.tab();
      expect(screen.getByRole('img')).not.toHaveFocus();
      expect(screen.getByRole('img')).not.toHaveAttribute('class', expect.stringMatching(/focus/i));
    });
  });
});
