import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { getMembershipLogs } from '../../services/api';
import Button from '../../components/Button';

const MembershipHistory = () => {
    const { memberId } = useParams();
    const navigate = useNavigate();
    const [member, setMember] = useState(null);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const memberRes = await api.get(`/members/${memberId}`);
                setMember(memberRes.data);

                const logsRes = await getMembershipLogs(memberId);
                setLogs(logsRes.data);
            } catch (error) {
                console.error("데이터 조회 실패:", error);
                alert("데이터를 불러오는 데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [memberId]);

    if (loading) return <div className="p-4 text-center">로딩 중...</div>;

    return (
        <div className="p-4">
            <div className="flex items-center mb-4">
                <Button onClick={() => navigate(-1)} size="sm" className="mr-2">←</Button>
                <h1 className="text-2xl font-bold">{member?.name}님의 결제 내역</h1>
            </div>

            <div className="space-y-3">
                {logs.length > 0 ? (
                    logs.map((log, index) => (
                        <div key={index} className="bg-white p-4 rounded-lg shadow">
                            <p className="font-bold text-lg">{new Date(log.registrationDate).toLocaleDateString()} 등록</p>
                            <div className="mt-2 border-t pt-2 text-sm space-y-1">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">정규 세션:</span>
                                    <span>{log.ptSessionCount} 회</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">서비스 세션:</span>
                                    <span>{log.serviceSessionCount} 회</span>
                                </div>
                                <div className="flex justify-between font-bold text-base">
                                    <span className="text-gray-800">결제 금액:</span>
                                    <span className="text-blue-600">{log.paymentAmount.toLocaleString()} 원</span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-500 py-8">결제 내역이 없습니다.</p>
                )}
            </div>
        </div>
    );
};

export default MembershipHistory;