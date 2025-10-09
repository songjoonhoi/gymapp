import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/Button';
import Input from '../../components/Input';
import api, { getLatestMembershipSummary } from '../../services/api';

const MembershipRegister = () => {
    const navigate = useNavigate();
    const { memberId } = useParams();
    const [member, setMember] = useState(null);
    const [previousMembership, setPreviousMembership] = useState(null);
    const [formData, setFormData] = useState({
        addPT: '',
        addService: '',
        startDate: '',
        endDate: '',
        paymentAmount: '',
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            let memberData = null;
            try {
                const memberResponse = await api.get(`/members/${memberId}`);
                setMember(memberResponse.data);
                memberData = memberResponse.data; // 회원 정보 임시 저장

                const summaryResponse = await getLatestMembershipSummary(memberId);
                setPreviousMembership(summaryResponse.data);

            } catch (error) {
                if (error.response?.status === 404 || error.response?.status === 204) {
                    console.log("회원 정보 또는 이전 등록 내역을 찾을 수 없습니다.");
                    if (!memberData) { // try 블록에서 회원 정보 로딩이 실패했을 경우
                        alert('회원 정보를 불러올 수 없습니다.');
                        navigate('/trainer/members');
                    }
                } else {
                    console.error('데이터 조회 실패:', error);
                    alert('데이터를 불러오는 데 실패했습니다.');
                }
            }
        };

        fetchData();
    }, [memberId, navigate]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const addPT = parseInt(formData.addPT) || 0;
        const addService = parseInt(formData.addService) || 0;

        if (addPT < 0 || addService < 0) {
            alert('세션 수는 0 이상이어야 합니다.');
            return;
        }
        if (addPT === 0 && addService === 0) {
            alert('최소 1개 이상의 세션을 등록해야 합니다.');
            return;
        }
        setLoading(true);

        try {
            const requestData = {
                addPT,
                addService,
                startDate: formData.startDate || null,
                endDate: formData.endDate || null,
                paymentAmount: formData.paymentAmount ? parseInt(formData.paymentAmount) : 0,
            };

            await api.post(`/memberships/register/${memberId}`, requestData);
            alert('PT 세션이 등록되었습니다!');
            navigate(`/trainer/members/${memberId}`);
        } catch (error) {
            console.error('PT 세션 등록 실패:', error);
            alert(error.response?.data?.message || 'PT 세션 등록에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-lg mx-auto px-4 py-4 flex items-center">
                    <button onClick={() => navigate(`/trainer/members/${memberId}`)} className="text-2xl mr-3">←</button>
                    <div>
                        <h1 className="text-xl font-bold">PT 세션 등록</h1>
                        <p className="text-xs text-gray-500">{member?.name}님</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-lg mx-auto px-4 py-6">
                <div className="bg-white rounded-2xl shadow-md p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        
                        {/* ✨ [수정] 'selectedMember'를 'member'로 변경했습니다. */}
                        {member && (
                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-base font-bold text-gray-800">이전 등록 내역</h3>
                                    <Button size="sm" onClick={() => navigate(`/trainer/members/${member.id}/membership/history`)}>
                                        전체 내역 보기
                                    </Button>
                                </div>
                                
                                {previousMembership ? (
                                    <div className="space-y-1 text-sm animate-fade-in">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">등록일:</span>
                                            <span className="font-semibold">{new Date(previousMembership.registrationDate).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">등록 세션:</span>
                                            <span className="font-semibold">
                                                정규 {previousMembership.ptSessionCount}회 / 서비스 {previousMembership.serviceSessionCount}회
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">결제 금액:</span>
                                            <span className="font-semibold">{previousMembership.paymentAmount.toLocaleString()} 원</span>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 text-center py-2">이전 등록 내역이 없습니다.</p>
                                )}
                            </div>
                        )}
                        
                        <Input
                            label="정규 PT 세션 (추가)"
                            type="number"
                            name="addPT"
                            value={formData.addPT}
                            onChange={handleChange}
                            placeholder="0"
                            required
                        />
                        <Input
                            label="서비스 세션 (추가)"
                            type="number"
                            name="addService"
                            value={formData.addService}
                            onChange={handleChange}
                            placeholder="0"
                            required
                        />
                        <div className="border-t pt-4 mt-4">
                            <p className="text-sm font-semibold text-gray-700 mb-3">이용 기간 (선택)</p>
                            <Input
                                label="시작일"
                                type="date"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleChange}
                            />
                            <Input
                                label="종료일"
                                type="date"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleChange}
                            />
                        </div>
                        <Input
                            label="결제 금액 (참고용)"
                            type="number"
                            name="paymentAmount"
                            value={formData.paymentAmount}
                            onChange={handleChange}
                            placeholder="0"
                            required
                        />
                        
                        <Button type="submit" fullWidth disabled={loading}>
                            {loading ? '등록 중...' : 'PT 세션 등록'}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default MembershipRegister;