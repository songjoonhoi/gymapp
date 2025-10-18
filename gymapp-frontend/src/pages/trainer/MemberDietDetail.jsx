import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/Button';
import api, { getAuthData } from '../../services/api';  // ✨ getAuthData 추가

const MemberDietDetail = () => {
  const navigate = useNavigate();
  const { memberId, dietId } = useParams();
  const [log, setLog] = useState(null);
  const [member, setMember] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  
  // ✨ 수정: getAuthData() 사용
  const getCurrentUser = () => {
    try {
      const { user } = getAuthData();
      return user || null;
    } catch (error) {
      console.error('사용자 정보 조회 실패:', error);
      return null;
    }
  };

  const currentUser = getCurrentUser();

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dietId]);

  const fetchData = async () => {
    try {
      // 1. 회원 정보
      const memberResponse = await api.get(`/members/${memberId}`);
      setMember(memberResponse.data);

      // 2. 식단 기록
      const response = await api.get(`/diet-logs/detail/${dietId}`);
      setLog(response.data);

      // 3. 댓글 목록
      await fetchComments();
    } catch (error) {
      console.error('식단 기록 조회 실패:', error);
      alert('기록을 불러올 수 없습니다.');
      navigate(`/trainer/members/${memberId}/diet`);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await api.get(`/diet-logs/${dietId}/comments`);
      setComments(response.data);
    } catch (error) {
      console.error('댓글 조회 실패:', error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      alert('코멘트 내용을 입력하세요.');
      return;
    }

    try {
      await api.post(`/diet-logs/${dietId}/comments`, { content: newComment });
      setNewComment('');
      fetchComments();
    } catch (error) {
      console.error('댓글 작성 실패:', error);
      alert(error.response?.data?.message || '코멘트 작성에 실패했습니다.');
    }
  };

  const handleCommentDelete = async (commentId) => {
    if (window.confirm('정말로 이 코멘트를 삭제하시겠습니까?')) {
      try {
        await api.delete(`/diet-logs/${dietId}/comments/${commentId}`);
        fetchComments();
      } catch (error) {
        console.error('댓글 삭제 실패:', error);
        alert(error.response?.data?.message || '코멘트 삭제에 실패했습니다.');
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR');
  };

  // ✨ 댓글 삭제 권한 체크 함수
  const canDeleteComment = (comment) => {
    if (!currentUser) {
      console.log('❌ currentUser가 없음');
      return false;
    }

    // 1. 관리자는 모든 댓글 삭제 가능
    if (currentUser.role === 'ADMIN') {
      console.log('✅ 관리자 권한');
      return true;
    }

    // 2. 댓글 작성자 본인
    if (currentUser.memberId === comment.memberId) {
      console.log('✅ 댓글 작성자 본인');
      return true;
    }

    // 3. 담당 트레이너 (member.trainerId와 현재 사용자 비교)
    if (currentUser.role === 'TRAINER' && member?.trainerId === currentUser.memberId) {
      console.log('✅ 담당 트레이너');
      return true;
    }

    console.log('❌ 권한 없음');
    return false;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  if (!log) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">기록을 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="max-w-lg mx-auto px-4 py-4 flex justify-between items-center">
        <button onClick={() => navigate(`/trainer/members/${memberId}/diet`)} className="text-2xl">←</button>
        <button
            onClick={() => navigate(`/trainer/members/${memberId}/diet/edit/${dietId}`)}
            className="text-primary font-semibold"
        >
            수정
        </button>
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
          {/* 회원 정보 표시 */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-sm text-green-800">
              <strong>{member?.name}</strong>님의 식단 기록
            </p>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{log.title}</h1>
            <p className="text-gray-500">{formatDate(log.createdAt)}</p>
          </div>

          {/* 칼로리 정보 */}
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

          {/* 내용 */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <pre className="whitespace-pre-wrap text-gray-700 text-lg leading-relaxed font-sans">
              {log.content}
            </pre>
          </div>
        </div>

        {/* ================ 댓글 섹션 ================ */}
        <div className="px-6 pb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-t pt-6">
            트레이너 코멘트 ({comments.length})
          </h2>

          {/* 댓글 목록 */}
          <div className="space-y-4">
            {comments.length > 0 ? (
              comments.map(comment => {
                const canDelete = canDeleteComment(comment);

                console.log('🔍 댓글 삭제 권한:', {
                  commentId: comment.id,
                  currentUserId: currentUser?.memberId,
                  commentAuthorId: comment.memberId,
                  role: currentUser?.role,
                  memberTrainerId: member?.trainerId,
                  canDelete: canDelete
                });

                return (
                  <div key={comment.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary rounded-full flex items-center justify-center font-bold text-white">
                      {comment.memberName.charAt(0)}
                    </div>
                    <div className="flex-1 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                      <div className="flex justify-between items-center mb-2">
                        <p className="font-semibold text-gray-800">{comment.memberName}</p>
                        {canDelete && (
                          <button
                            onClick={() => handleCommentDelete(comment.id)}
                            className="text-xs text-red-500 hover:text-red-700 font-medium"
                          >
                            삭제
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mb-2">{formatDate(comment.createdAt)}</p>
                      <p className="text-gray-700 leading-relaxed">{comment.content}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg">
                아직 코멘트가 없습니다. 첫 코멘트를 남겨보세요!
              </p>
            )}
          </div>

          {/* 댓글 작성 폼 */}
          <form onSubmit={handleCommentSubmit} className="mt-6">
            <textarea
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition resize-none"
              rows="4"
              placeholder="회원에게 피드백이나 조언을 남겨주세요..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <div className="flex justify-between items-center mt-3">
              <p className="text-sm text-gray-500">
                💡 회원이 이 코멘트를 볼 수 있습니다
              </p>
              <Button type="submit" disabled={!newComment.trim()}>
                코멘트 작성
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MemberDietDetail;