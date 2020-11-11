import React from 'react';
import { LoadingStatus } from '../../store/reducers/types';

interface Props {
  name: string;
  status: LoadingStatus;
}

const Status: React.FC<Props> = ({name, status}) => {
  return <div>{name} - {status}</div>
}

export default Status;