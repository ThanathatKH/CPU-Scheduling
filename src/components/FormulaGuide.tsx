import React, { useState } from 'react';

export const FormulaGuide: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="card clean-card formula-accordion">
      <div 
        className="accordion-header flex-between" 
        onClick={() => setIsOpen(!isOpen)}
        style={{ cursor: 'pointer' }}
      >
        <div className="flex-center gap-2">
          <h3>📖 นิยามและสูตรคำนวณ (CPU Scheduling Formulas & Definitions)</h3>
          <span className="badge-pill">{isOpen ? 'ซ่อนรายละเอียด' : 'แสดงรายละเอียด'}</span>
        </div>
        <span className="arrow-icon">{isOpen ? '▲' : '▼'}</span>
      </div>

      {isOpen && (
        <div className="formula-grid margin-top">
          <div className="formula-box">
            <h4>เวลาเริ่มต้นทำงาน (Start Time: ST)</h4>
            <p>เวลาที่โพรเซสถูกดึงเข้าประมวลผลบน CPU เป็นครั้งแรกสุด</p>
          </div>

          <div className="formula-box">
            <h4>เวลาเสร็จสิ้น (Completion Time: CT)</h4>
            <p>เวลาที่โพรเซสประมวลผล Burst Time ทั้งหมดเสร็จสิ้นเรียบร้อย</p>
          </div>

          <div className="formula-box">
            <h4>เวลาประมวลผลรวม (Turnaround Time: TAT)</h4>
            <code className="formula-code">TAT = CT - AT = CT</code>
            <p>ระยะเวลาตั้งแต่โพรเซสมาถึงจนทำงานเสร็จ (เนื่องจาก AT = 0 ดังนั้น TAT = CT)</p>
          </div>

          <div className="formula-box">
            <h4>เวลาการรอคอย (Waiting Time: WT)</h4>
            <code className="formula-code">WT = TAT - BT</code>
            <p>ระยะเวลารวมที่โพรเซสต้องนั่งรออยู่ใน Ready Queue ก่อนจะเสร็จสิ้น</p>
          </div>

          <div className="formula-box full-width">
            <h4>เวลาการรอคอยเฉลี่ย (Average Waiting Time: AVG WT)</h4>
            <code className="formula-code">AVG WT = (ผลรวมของ WT ทุกโพรเซส) / จำนวนโพรเซสทั้งหมด (N)</code>
            <p>ตัวชี้วัดประสิทธิภาพหลักของอัลกอริทึม ยิ่งค่าน้อยแสดงว่าอัลกอริทึมจัดคิวได้รวดเร็วและมีประสิทธิภาพสูง</p>
          </div>
        </div>
      )}
    </div>
  );
};
