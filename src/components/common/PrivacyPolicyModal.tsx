"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { X, Shield, FileText } from "lucide-react";

type PrivacyPolicyModalProps = {
    isOpen: boolean;
    onClose: () => void;
    initialTab?: 'privacy' | 'terms';
};

const PRIVACY_POLICY_CONTENT = `
# 아이니의원 개인정보 처리방침
 
 아이니의원(이하 "병원")은 「개인정보 보호법」, 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 등 관련 법령이 정한 개인정보 보호 규정을 준수하며, 이용자의 권익 보호를 위해 본 개인정보 처리방침을 수립·공개합니다.

## 1. 수집하는 개인정보의 항목 및 수집방법

병원은 서비스 제공에 필요한 최소한의 개인정보를 수집합니다.

### 1) 회원가입 및 계정 관리 시
- **필수**: 이름, 휴대폰번호, 이메일 주소, 본인확인 정보
- **선택**: 생년월일, 성별

### 2) 예약·상담·문의 시
- **필수**: 성명, 연락처(휴대폰번호)
- **선택**: 상담 내용, 문의 유형, 선호 일정

### 3) 진료 지원 이용 과정에서
- 서비스 이용기록, 접속로그, IP주소, 쿠키, 기기정보
- 증상·생활습관·병력 관련 정보 (민감정보 포함 가능)

## 2. 개인정보의 수집 및 이용목적

1. **서비스 제공 및 계약 이행**
2. **진료 지원 및 맞춤형 안내**
3. **부정 이용 방지 및 보안**
4. **서비스 개선 및 통계·분석**

## 3. 개인정보의 제3자 제공

병원은 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다.

## 4. 개인정보 보유 및 이용기간

- **환자 명부**: 5년
- **진료기록부/수술기록**: 10년
- **처방전**: 2년

## 5. 이용자의 권리

1. 개인정보 조회·수정 권리
2. 회원탈퇴를 통한 동의 철회 권리
3. 만 14세 미만 아동의 경우 법정대리인 권리 행사

## 6. 개인정보 보호책임자

개인정보 관련 문의, 불만처리, 피해구제 등을 담당합니다.

---
공고일자: 2025년 12월 19일
시행일자: 2025년 12월 19일
`;

const TERMS_CONTENT = `
# 아이니의원 서비스 이용약관
 
 ## 제1조 (목적)
 
 본 약관은 아이니의원(이하 "병원")이 제공하는 웹/앱 서비스의 이용조건 및 절차에 관한 사항을 규정함을 목적으로 합니다.

## 제2조 (정의)

1. "서비스"란 병원이 제공하는 예약, 상담, 건강정보 제공 등의 온라인 서비스를 말합니다.
2. "이용자"란 본 약관에 따라 서비스를 이용하는 회원 및 비회원을 말합니다.

## 제3조 (서비스 이용)

1. 서비스는 연중무휴, 1일 24시간 제공함을 원칙으로 합니다.
2. 시스템 점검 등의 사유로 서비스가 일시 중단될 수 있습니다.

## 제4조 (면책조항)

1. 본 서비스에서 제공하는 건강 정보는 **의학적 진단이나 처방을 대체하지 않습니다**.
2. 정확한 진단과 치료는 반드시 의료기관을 방문하여 받으시기 바랍니다.
3. 응급상황 발생 시 즉시 119 또는 가까운 응급실을 이용하세요.

## 제5조 (개인정보 보호)

이용자의 개인정보 보호에 관한 사항은 별도의 개인정보 처리방침에 따릅니다.

## 제6조 (분쟁 해결)

서비스 이용과 관련된 분쟁은 상호 협의하여 해결하며, 협의가 이루어지지 않을 경우 관할 법원에서 해결합니다.

---
시행일: 2025년 12월 19일
`;

export default function PrivacyPolicyModal({ isOpen, onClose, initialTab = 'privacy' }: PrivacyPolicyModalProps) {
    const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>(initialTab);

    if (!isOpen) return null;

    const renderContent = (content: string) => {
        return content.split('\n').map((line, idx) => {
            if (line.startsWith('# ')) {
                return <h1 key={idx} className="text-xl font-bold text-gray-900 mb-4 mt-6">{line.replace('# ', '')}</h1>;
            }
            if (line.startsWith('## ')) {
                return <h2 key={idx} className="text-lg font-bold text-gray-800 mb-3 mt-5">{line.replace('## ', '')}</h2>;
            }
            if (line.startsWith('### ')) {
                return <h3 key={idx} className="text-base font-semibold text-gray-700 mb-2 mt-4">{line.replace('### ', '')}</h3>;
            }
            if (line.startsWith('- ')) {
                return <li key={idx} className="text-gray-600 text-sm ml-4 mb-1">{line.replace('- ', '')}</li>;
            }
            if (line.startsWith('---')) {
                return <hr key={idx} className="my-4 border-gray-200" />;
            }
            if (line.trim()) {
                return <p key={idx} className="text-gray-600 text-sm mb-2">{line}</p>;
            }
            return null;
        });
    };

    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gray-50 p-4 flex justify-between items-center border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-gray-600" />
                        <h3 className="font-bold text-lg text-gray-900">약관 및 정책</h3>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2">
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('privacy')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'privacy' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Shield className="w-4 h-4 inline mr-1" />
                        개인정보 처리방침
                    </button>
                    <button
                        onClick={() => setActiveTab('terms')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'terms' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <FileText className="w-4 h-4 inline mr-1" />
                        이용약관
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'privacy' ? renderContent(PRIVACY_POLICY_CONTENT) : renderContent(TERMS_CONTENT)}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-gray-800 text-white rounded-xl font-medium hover:bg-gray-900 transition-colors"
                    >
                        확인
                    </button>
                </div>
            </div>
        </div>
    );

    if (typeof document !== 'undefined') {
        return createPortal(modalContent, document.body);
    }
    return modalContent;
}
