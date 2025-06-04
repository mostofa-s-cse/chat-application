import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { increment, decrement, incrementByAmount, reset } from '../store/counterSlice';

const Counter: React.FC = () => {
  const count = useSelector((state: RootState) => state.counter.value);
  const dispatch = useDispatch();

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
        Redux Counter
      </h2>
      
      <div className="text-center mb-6">
        <span className="text-6xl font-bold text-blue-600">{count}</span>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          onClick={() => dispatch(increment())}
          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded transition duration-200"
        >
          +1
        </button>
        <button
          onClick={() => dispatch(decrement())}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded transition duration-200"
        >
          -1
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => dispatch(incrementByAmount(5))}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition duration-200"
        >
          +5
        </button>
        <button
          onClick={() => dispatch(reset())}
          className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition duration-200"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default Counter;