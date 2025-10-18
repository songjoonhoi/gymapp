import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/Button';
import api, { getAuthData } from '../../services/api';
import BottomNav from '../../components/BottomNav';

// ✨ 현재 로그인한 사용자 정보를 가져오는 헬퍼 함수
const getCurrentUser = () => {
    try {
        const { user } = getAuthData();
        if (!user) return null;
        
        // 백엔드 UserPrincipal과 유사한 권한 정보를 추가
        user.isAdmin = user.role === 'ADMIN';
        user.isTrainer = user.role === 'TRAINER';
        return user;
    } catch (error) {
        return null;
    }
};

const DietDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [log, setLog] = useState(null);
    const [member, setMember] = useState(null);  // ✨ 추가: 회원 정보
    const [loading, setLoading] = useState(true);
    
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const currentUser = getCurrentUser();

    useEffect(() => {
        fetchLogDetail();
        fetchComments();
    }, [id]);

    const fetchLogDetail = async () => {
        try {
            // 1. 식단일지 조회
            const response = await api.get(`/diet-logs/detail/${id}`);
            setLog(response.data);

            // 2. ✨ 회원 정보 조회 (trainerId 확인용)
            try {
                const memberResponse = await api.get(`/members/${response.data.memberId}`);
                setMember(memberResponse.data);
            } catch (memberError) {
                console.error('회원 정보 조회 실패:', memberError);
                // 회원 정보를 못 가져와도 식단일지는 표시
            }
        } catch (error) {
            console.error('식단 기록 조회 실패:', error);
            alert('기록을 불러올 수 없습니다.');
            navigate('/diet');
        } finally {
            setLoading(false);
        }
    };

    const fetchComments = async () => {
        try {
            const response = await api.get(`/diet-logs/${id}/comments`);
            setComments(response.data);
        } catch (error) {
            console.error("댓글 조회 실패:", error);
        }
    };
    
    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) {
            alert("댓글 내용을 입력하세요.");
            return;
        }
        try {
            await api.post(`/diet-logs/${id}/comments`, { content: newComment });
            setNewComment('');
            fetchComments();
        } catch (error) {
            console.error("댓글 작성 실패:", error);
            alert(error.response?.data?.message || "댓글 작성에 실패했습니다.");
        }
    };

    const handleCommentDelete = async (commentId) => {
        if (window.confirm("정말로 이 댓글을 삭제하시겠습니까?")) {
            try {
                await api.delete(`/diet-logs/${id}/comments/${commentId}`);
                fetchComments();
            } catch (error) {
                console.error("댓글 삭제 실패:", error);
                alert(error.response?.data?.message || "댓글 삭제에 실패했습니다.");
            }
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('정말 삭제하시겠습니까?')) return;
        try {
            await api.delete(`/diet-logs/${id}`);
            alert('삭제되었습니다.');
            navigate('/diet');
        } catch (error) {
            alert('삭제에 실패했습니다.');
            console.error(error);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('ko-KR');
    };

    // ✨ 댓글 삭제 권한 체크 함수 (수정!)
    const canDeleteComment = (comment) => {
        if (!currentUser) return false;

        // 1. 관리자는 모든 댓글 삭제 가능
        if (currentUser.isAdmin) return true;

        // 2. 댓글 작성자 본인
        if (currentUser.memberId === comment.memberId) return true;

        // 3. 담당 트레이너 (member.trainerId와 현재 사용자 비교)
        if (currentUser.isTrainer && member?.trainerId === currentUser.memberId) {
            return true;
        }

        return false;
    };

    if (loading) {
        return <div className="p-4 text-center">로딩 중...</div>;
    }

    if (!log) {
        return <div className="p-4 text-center">기록을 찾을 수 없습니다.</div>;
    }

    // 본인 또는 관리자만 수정/삭제 가능
    const canModifyLog = currentUser && (currentUser.memberId === log.memberId || currentUser.isAdmin);

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-lg mx-auto px-4 py-4 flex justify-between items-center">
                    <button onClick={() => navigate('/diet')} className="text-2xl">←</button>
                    {canModifyLog && (
                         <button
                            onClick={() => navigate(`/diet/edit/${id}`)}
                            className="text-primary font-semibold"
                        >
                            수정
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="max-w-lg mx-auto">
                {log.mediaUrl && (
                    <img
                        src={`http://localhost:7777${log.mediaUrl}`}
                        alt={log.title}
                        className="w-full h-80 object-contain bg-gray-100"
                    />
                )}

                <div className="p-6 space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">{log.title}</h1>
                        <p className="text-gray-500">{formatDate(log.createdAt)}</p>
                    </div>

                    {log.calories && (
                       <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
                           <div className="flex items-center mb-3">
                               <span className="text-2xl mr-2">🥗</span>
                               <h3 className="text-lg font-bold text-green-900">영양 정보</h3>
                           </div>
                           <div className="mb-3">
                               <p className="text-sm text-green-700 mb-1">칼로리</p>
                               <p className="text-2xl font-bold text-green-900">{log.calories} kcal</p>
                           </div>
                       </div>
                    )}
                    
                    <div className="bg-white rounded-2xl shadow-md p-6">
                        <pre className="whitespace-pre-wrap text-gray-700 text-lg leading-relaxed font-sans">
                            {log.content}
                        </pre>
                    </div>

                    {canModifyLog && (
                        <Button variant="danger" fullWidth onClick={handleDelete}>삭제</Button>
                    )}
                </div>

                {/* ✨ 댓글 섹션 */}
                <div className="px-6 pb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 border-t pt-6">댓글 ({comments.length})</h2>

                    {/* 댓글 목록 */}
                    <div className="space-y-4">
                        {comments.length > 0 ? comments.map(comment => {
                            const canDelete = canDeleteComment(comment);

                            console.log('🔍 댓글 삭제 권한:', {
                                commentId: comment.id,
                                currentUserId: currentUser?.memberId,
                                commentAuthorId: comment.memberId,
                                isAdmin: currentUser?.isAdmin,
                                isTrainer: currentUser?.isTrainer,
                                memberTrainerId: member?.trainerId,
                                canDelete: canDelete
                            });

                            return (
                                <div key={comment.id} className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500">
                                        {comment.memberName.charAt(0)}
                                    </div>
                                    <div className="flex-1 bg-white p-3 rounded-lg shadow-sm">
                                        <div className="flex justify-between items-center">
                                            <p className="font-semibold text-gray-800">{comment.memberName}</p>
                                            {canDelete && (
                                                <button 
                                                    onClick={() => handleCommentDelete(comment.id)} 
                                                    className="text-xs text-red-500 hover:text-red-700"
                                                >
                                                    삭제
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 mb-2">{formatDate(comment.createdAt)}</p>
                                        <p className="text-gray-700">{comment.content}</p>
                                    </div>
                                </div>
                            );
                        }) : (
                            <p className="text-gray-500 text-center py-4">아직 댓글이 없습니다.</p>
                        )}
                    </div>

                    {/* 댓글 작성 폼 */}
                    <form onSubmit={handleCommentSubmit} className="mt-6">
                        <textarea
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                            rows="3"
                            placeholder={currentUser ? "댓글을 입력하세요..." : "로그인이 필요합니다."}
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            disabled={!currentUser}
                        />
                        <div className="text-right mt-2">
                            <Button type="submit" disabled={!currentUser || !newComment.trim()}>
                                댓글 작성
                            </Button>
                        </div>
                    </form>
                </div>

            </div>
            <BottomNav />
        </div>
    );
};

export default DietDetail;