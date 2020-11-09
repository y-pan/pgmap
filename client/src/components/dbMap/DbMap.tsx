import React ,  {useEffect} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getConstraintsSaga } from '../../store/actions/constraints';
import { getSchemasSaga } from '../../store/actions/schemas';
import { getTablesSaga } from '../../store/actions/tables';
import { LoadingStatus } from '../../store/reducers/types';
import { getConstraints, getConstraintsStatus } from '../../store/selectors/constaints';
import { getSchemas, getSchemasStatus } from '../../store/selectors/schemas';
import { getTables, getTablesStatus } from '../../store/selectors/tables';

interface Props {
}
const DbMap: React.FC<Props> = (props) => {
    const dispatch = useDispatch();

    const schemas = useSelector(getSchemas)
    const schemasStatus = useSelector(getSchemasStatus);
    console.log("### schemas", schemas, schemasStatus);
    // load schemas
    useEffect(() => {
        if (schemasStatus === LoadingStatus.INITIAL) {
            dispatch(getSchemasSaga());           
        }
    }, [schemasStatus]);

    // load tables
    const tables = useSelector(getTables);
    const tablesStatus = useSelector(getTablesStatus);
    console.log("### tables", tables, tablesStatus);
    useEffect(() => {
        if (tablesStatus === LoadingStatus.INITIAL) {
            dispatch(getTablesSaga());
        }
    }, [tablesStatus]);

    // load constraints
    const constraints = useSelector(getConstraints);
    const consraintsStauts = useSelector(getConstraintsStatus);
    console.log("### constr", constraints, consraintsStauts);
    useEffect(() => {
        if (consraintsStauts === LoadingStatus.INITIAL) {
            dispatch(getConstraintsSaga());
        }
    }, [consraintsStauts]);

    return  <div>This is DbMap</div>
}

export default DbMap;