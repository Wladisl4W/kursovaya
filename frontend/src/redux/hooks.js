import { useDispatch, useSelector } from 'react-redux';
import { store } from './store';

// Типизированные хуки для использования в приложении
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;