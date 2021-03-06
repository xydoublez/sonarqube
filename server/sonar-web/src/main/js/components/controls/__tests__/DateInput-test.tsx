/*
 * SonarQube
 * Copyright (C) 2009-2018 SonarSource SA
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
import * as React from 'react';
import { subMonths, setMonth, setYear, addDays, subDays } from 'date-fns';
import DateInput, { Props } from '../DateInput';
import { shallowWithIntl } from '../../../helpers/testUtils';
import { parseDate } from '../../../helpers/dates';

// need to mock, because react-day-picker uses `new Date()` as a default prop for `initialMonth`
jest.mock('react-day-picker', () => ({
  // eslint-disable-next-line func-name-matching
  default: function DayPicker() {
    return null;
  }
}));

const dateA = parseDate('2018-01-17T00:00:00.000Z');
const dateB = parseDate('2018-02-05T00:00:00.000Z');

it('should render', () => {
  // pass `maxDate` and `minDate` to avoid differences in snapshots
  const { wrapper } = shallowRender();

  expect(wrapper).toMatchSnapshot();
  expect(wrapper.dive()).toMatchSnapshot();

  wrapper.setProps({ value: dateA });
  expect(wrapper.dive()).toMatchSnapshot();

  wrapper.setState({ open: true });
  expect(wrapper.dive()).toMatchSnapshot();
});

it('should change current month', () => {
  const { wrapper, instance } = shallowRender();
  expect(wrapper.state().currentMonth).toEqual(dateA);

  instance.handlePreviousMonthClick();
  expect(wrapper.state().currentMonth).toEqual(subMonths(dateA, 1));

  instance.handleNextMonthClick();
  expect(wrapper.state().currentMonth).toEqual(dateA);

  instance.handleCurrentMonthChange({ value: 5 });
  expect(wrapper.state().currentMonth).toEqual(setMonth(dateA, 5));

  instance.handleCurrentYearChange({ value: 2015 });
  expect(wrapper.state().currentMonth).toEqual(setYear(setMonth(dateA, 5), 2015));
});

it('should select a day', () => {
  const onChange = jest.fn();
  const { wrapper, instance } = shallowRender({ onChange });
  wrapper.setState({ open: true });

  instance.handleDayClick(dateA, { disabled: true, outside: undefined, today: undefined });
  expect(onChange).not.toBeCalled();
  expect(wrapper.state().open).toBe(true);

  instance.handleDayClick(dateA, { outside: undefined, today: undefined });
  expect(onChange).lastCalledWith(dateA);
  expect(wrapper.state().open).toBe(false);
  expect(wrapper.dive()).toMatchSnapshot();

  instance.handleResetClick();
  expect(onChange).lastCalledWith(undefined);
});

it('should hightlightFrom range', () => {
  const { wrapper, instance } = shallowRender({ highlightFrom: dateA });
  wrapper.setState({ open: true });

  const dateC = addDays(dateA, 3);
  instance.handleDayMouseEnter(dateC, { outside: undefined, today: undefined });
  wrapper.update();
  const dayPicker = wrapper.dive().find('DayPicker');
  expect(dayPicker.prop('modifiers')).toEqual({ highlighted: { from: dateA, to: dateC } });
  expect(dayPicker.prop('selectedDays')).toEqual([dateA]);
});

it('should hightlightTo range', () => {
  const { wrapper, instance } = shallowRender({ highlightTo: dateB });
  wrapper.setState({ open: true });

  const dateC = subDays(dateB, 5);
  instance.handleDayMouseEnter(dateC, { outside: undefined, today: undefined });
  wrapper.update();
  const dayPicker = wrapper.dive().find('DayPicker');
  expect(dayPicker.prop('modifiers')).toEqual({ highlighted: { from: dateC, to: dateB } });
  expect(dayPicker.prop('selectedDays')).toEqual([dateB]);
});

function shallowRender(props?: Partial<Props>) {
  const wrapper = shallowWithIntl(
    <DateInput
      currentMonth={dateA}
      maxDate={dateB}
      minDate={dateA}
      onChange={jest.fn()}
      placeholder="placeholder"
      {...props}
    />
  );
  const instance = wrapper.instance() as DateInput;
  return { wrapper, instance };
}
