import { IComponentHandler } from '../interface';
import { SignalCalculator } from './signal-calculator';

export const COMPONENT_HANDLERS: IComponentHandler[] = [new SignalCalculator()];
