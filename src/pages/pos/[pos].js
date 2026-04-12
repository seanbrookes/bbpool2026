import React, {useState, useEffect} from 'react';
import { useRouter } from 'next/router';
import { PositionGrid } from '../../components/PositionGrid';
import { Layout } from '../../components/Layout';
const PosPage = ({rec, res, query}) => {
  const router = useRouter()
  const { pos } = router.query
  return (<Layout><PositionGrid pos={pos} /></Layout>);
};

export default PosPage;
