import React ,  {useEffect} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getSchemasSaga } from '../../store/actions/schemas';
import { LoadingStatus } from '../../store/reducers/types';
import { getSchemas, getSchemasStatus } from '../../store/selectors/schemas';

interface Props {
}
const DbMap: React.FC<Props> = (props) => {
    const dispatch = useDispatch();
    const schemas = useSelector(getSchemas)
    const schemasStatus = useSelector(getSchemasStatus);

    // load schemas
    useEffect(() => {
        if (schemasStatus === LoadingStatus.INITIAL) {
            dispatch(getSchemasSaga());           
        }
    }, [schemasStatus])

    // load tables
    
    // load constraints
   return  <div>This is DbMap</div>
}

export default DbMap;