import React ,  {useEffect} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getSchemasSaga, setCurrentSchemaSaga } from '../../store/actions/schemas';
import { LoadingStatus } from '../../store/reducers/types';
import { getCurrent, getSchemasStatus, getSetCurrentSchemaStatus } from '../../store/selectors/schemas';

interface Props {
}
const DbMap: React.FC<Props> = (props) => {
    const dispatch = useDispatch();
    const currentSchema = useSelector(getCurrent);
    const currentSchemaStatus = useSelector(getSetCurrentSchemaStatus)
    // const schemas = useSelector(getSchemas)
    const schemasStatus = useSelector(getSchemasStatus);
    // load schemas
    useEffect(() => {
        if (schemasStatus === LoadingStatus.INITIAL) {
            dispatch(getSchemasSaga());           
        }
        if (schemasStatus === LoadingStatus.SUCCEEDED && currentSchemaStatus === LoadingStatus.INITIAL) {
            // user pick 1 schema, 
            // then subsequently fetch everything for that schema (tables, columns, contraints)
            // in order to draw the whole map (schema map)
            dispatch(setCurrentSchemaSaga("public"));
        }
    }, [currentSchema, schemasStatus, dispatch, currentSchemaStatus]);

    return  <div>This is DbMap</div>
}

export default DbMap;