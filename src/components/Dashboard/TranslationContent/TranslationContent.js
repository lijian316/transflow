import React, { useState } from 'react';
import {
  Card,
  Input,
  Button,
  Form,
  Modal,
  Popconfirm,
  Select,
  message
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
  GlobalOutlined,
  MoreOutlined,
  DatabaseOutlined,
  TagsOutlined,
  CloseOutlined,
  FileTextOutlined,
  BarChartOutlined,
  DownOutlined,
  UpOutlined,
  KeyOutlined
} from '@ant-design/icons';
import { getMessage } from '../../../locales';
import { useLanguage } from '../../../contexts/LanguageContext';
import './TranslationContent.css';

const { TextArea } = Input;

const TranslationContent = ({
  // 状态
  translations,
  languages,
  loading,
  searchQuery,
  isModalVisible,
  editingTranslation,
  isDatabaseModalVisible,
  activeTab,
  
  // 标签相关
  tags,
  currentTag,
  selectedLanguage,
  isTagModalVisible,
  tagForm,
  
  // 日志相关
  logs,
  
  // 数据库相关
  currentDatabase,
  databases,
  onSwitchDatabase,
  onCreateDatabase,
  
  // 语言管理相关
  isLanguagePanelVisible,
  isTagPanelVisible,
  isLogPanelVisible,
  
  // 表单
  form,
  databaseForm,
  
  // 事件处理
  setSearchQuery,
  handleSearch,
  setActiveTab,
  setCurrentTag,
  setSelectedLanguage,
  handleAddTranslation,
  handleEditTranslation,
  handleDeleteTranslation,
  handleModalOk,
  handleCreateTag,
  handleDeleteTag,
  handleTagModalOk,
  setIsTagModalVisible,
  handleExport,
  exportLanguageData,
  handleCreateDatabase,
  setIsModalVisible,
  setIsDatabaseModalVisible,
  handleRemoveLanguage,
  handleToggleLanguage,
  handleCreateLanguage,
  handleAddTag,
  handleShowLogs,
  setIsLanguagePanelVisible,
  setIsTagPanelVisible,
  setIsLogPanelVisible,
  
  // 分页相关
  hasMore,
  loadingMore,
  onLoadMore,
  totalCount,
  
  // 国际化
  getBilingualLanguageName
}) => {
  const { locale } = useLanguage();
  // 卡片展开状态管理
  const [expandedCards, setExpandedCards] = useState(new Set());

  // Key筛选状态
  const [keyFilter, setKeyFilter] = useState(null); // null, 'withKey', 'withoutKey'
  
  // 搜索弹窗状态
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  
  // 切换卡片展开状态
  const toggleCardExpanded = (cardId) => {
    const newExpandedCards = new Set(expandedCards);
    if (newExpandedCards.has(cardId)) {
      newExpandedCards.delete(cardId);
    } else {
      newExpandedCards.add(cardId);
    }
    setExpandedCards(newExpandedCards);
  };





  // 搜索弹窗处理
  const handleSearchIconClick = () => {
    setSearchModalVisible(true);
  };

  const handleSearchModalOk = () => {
    handleSearch();
    setSearchModalVisible(false);
  };

  // 翻译日志操作类型
  const translateLogOperation = (operationType) => {
    const operationMap = {
      '新增': getMessage('logAdd', locale),
      '更新': getMessage('logUpdate', locale),
      '删除': getMessage('logDelete', locale),
      '新增标签': getMessage('logAddTag', locale),
      '删除标签': getMessage('logDeleteTag', locale)
    };
    return operationMap[operationType] || operationType;
  };
  // 计算统计数据
  const totalEntries = totalCount || translations.length;
  
  // 计算key统计
  const entriesWithKey = translations.filter(t => t.key && t.key.trim() !== '').length;
  const entriesWithoutKey = totalEntries - entriesWithKey;
  
  // 根据key筛选过滤翻译数据
  const filteredTranslations = keyFilter 
    ? translations.filter(t => {
        const hasKey = t.key && t.key.trim() !== '';
        return keyFilter === 'withKey' ? hasKey : !hasKey;
      })
    : translations;
  
  // 计算总语言版本数量
  const totalLanguages = languages.length;

  return (
    <>
      {/* 页面标题区域 */}
      <div className="page-title-section">
        <div className="page-title-container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
          flexWrap: 'wrap'
        }}>
          <h1 className="page-title" style={{
            fontSize: '28px',
            fontWeight: '600',
            color: '#24292f',
            margin: 0,
            letterSpacing: '0.5px',
            minWidth: '200px'
          }}>{getMessage('pageTitle', locale)}</h1>
          <div className="page-title-actions" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap',
            justifyContent: 'flex-end',
            flex: 1
          }}>
            <Select
              value={currentDatabase}
              style={{ 
                width: 200,
                borderRadius: '6px',
                fontWeight: '400',
                flexShrink: 0
              }}
              placeholder={getMessage('selectDatabase', locale)}
              onChange={onSwitchDatabase}
            >
              {databases.map(db => {
                // 移除.db后缀并添加"语言表"后缀
                const displayName = db.replace('.db', '') + (locale === 'zh' ? ' 语言表' : ' Language Table');
                return (
                  <Select.Option key={db} value={db}>
                    {displayName}
                  </Select.Option>
                );
              })}
            </Select>
            <Button
              type="primary"
              icon={<DatabaseOutlined style={{ fontSize: '14px' }} />}
              onClick={onCreateDatabase}
              className="create-database-btn"
              style={{ flexShrink: 0 }}
            >
              {getMessage('createDatabase', locale)}
            </Button>
          </div>
        </div>
      </div>

      {/* 统计卡片区域 */}
      <div className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-header">
              <div className="stat-card-value">
                <span style={{ color: '#667eea' }}>{totalEntries}</span>
                <BarChartOutlined style={{ color: '#667eea', fontSize: '24px' }} />
              </div>
              <div className="stat-card-label">{getMessage('totalEntries', locale)}</div>
            </div>
            <div className="stat-card-footer">
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: '8px',
                minHeight: '60px',
                justifyContent: 'center'
              }}>
                <div className="stat-card-change positive">
                  <span>↗</span>
                  <span>{getMessage('growing', locale)}</span>
                </div>
                                  <div style={{ 
                    fontSize: '12px', 
                    color: '#656d76',
                    fontWeight: '400',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>

                  
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'row',
                    gap: '12px',
                    fontSize: '11px',
                    color: '#8c959f'
                  }}>
                    <span>
                      {getMessage('withKey', locale)}: {entriesWithKey}
                    </span>
                    <span>
                      {getMessage('withoutKey', locale)}: {entriesWithoutKey}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div 
            className="stat-card" 
            style={{ 
              position: 'relative',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onClick={handleCreateLanguage}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(9, 105, 218, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '';
            }}
          >
            <div className="stat-card-header">
              <div className="stat-card-value">
                <span style={{ color: '#0969da' }}>{totalLanguages}</span>
                <GlobalOutlined style={{ color: '#0969da', fontSize: '24px' }} />
              </div>
              <div className="stat-card-label">{getMessage('languageManagement', locale)}</div>
            </div>
            <div className="stat-card-footer">
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: '8px',
                minHeight: '60px',
                justifyContent: 'center'
              }}>
                <div className="stat-card-change positive">
                  <span>↗</span>
                  <span>{getMessage('multiLanguageSupport', locale)}</span>
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#656d76',
                  fontWeight: '400'
                }}>
                  {getMessage('currentSupport', locale, { count: totalLanguages })}
                </div>
                <Button
                  type="text"
                  icon={<MoreOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCreateLanguage();
                  }}
                  size="small"
                  style={{ 
                    position: 'absolute',
                    bottom: '8px',
                    right: '8px',
                    padding: '4px',
                    fontSize: '12px',
                    color: '#0969da',
                    backgroundColor: 'transparent',
                    border: 'none',
                    opacity: '1',
                    visibility: 'visible'
                  }}
                />
              </div>
            </div>
          </div>

          <div 
            className="stat-card" 
            style={{ 
              position: 'relative',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onClick={handleCreateTag}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(130, 80, 223, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '';
            }}
          >
            <div className="stat-card-header">
              <div className="stat-card-value">
                <span style={{ color: '#8250df' }}>{tags?.length || 0}</span>
                <TagsOutlined style={{ color: '#8250df', fontSize: '24px' }} />
              </div>
              <div className="stat-card-label">{getMessage('tagManagement', locale)}</div>
            </div>
            <div className="stat-card-footer">
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: '8px',
                minHeight: '60px',
                justifyContent: 'center'
              }}>
                <div className="stat-card-change positive">
                  <span>↗</span>
                  <span>{getMessage('tagManagement', locale)}</span>
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#656d76',
                  fontWeight: '400'
                }}>
                  {locale === 'en' ? `Total ${tags?.length || 0} tags` : `共有 ${tags?.length || 0} 个标签`}
                </div>
                <Button
                  type="text"
                  icon={<MoreOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCreateTag();
                  }}
                  size="small"
                  style={{ 
                    position: 'absolute',
                    bottom: '8px',
                    right: '8px',
                    padding: '4px',
                    fontSize: '12px',
                    color: '#8250df',
                    backgroundColor: 'transparent',
                    border: 'none',
                    opacity: '1',
                    visibility: 'visible'
                  }}
                />
              </div>
            </div>
          </div>

          <div 
            className="stat-card" 
            style={{ 
              position: 'relative',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onClick={handleShowLogs}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(45, 164, 78, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '';
            }}
          >
            <div className="stat-card-header">
              <div className="stat-card-value">
                <span style={{ color: '#2da44e' }}>{logs?.length || 0}</span>
                <FileTextOutlined style={{ color: '#2da44e', fontSize: '24px' }} />
              </div>
              <div className="stat-card-label">{getMessage('operationLogs', locale)}</div>
            </div>
            <div className="stat-card-footer">
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: '8px',
                minHeight: '60px',
                justifyContent: 'center'
              }}>
                <div className="stat-card-change positive">
                  <span>↗</span>
                  <span>{getMessage('logs', locale)}</span>
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#656d76',
                  fontWeight: '400'
                }}>
                  {logs?.length > 0 ? `${logs.length} ${getMessage('logRecords', locale)}` : getMessage('noLogs', locale)}
                </div>
                <Button
                  type="text"
                  icon={<MoreOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShowLogs();
                  }}
                  size="small"
                  style={{ 
                    position: 'absolute',
                    bottom: '8px',
                    right: '8px',
                    padding: '4px',
                    fontSize: '12px',
                    color: '#2da44e',
                    backgroundColor: 'transparent',
                    border: 'none',
                    opacity: '1',
                    visibility: 'visible'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 遮罩层 */}
      {(isLanguagePanelVisible || isTagPanelVisible) && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 999
        }} />
      )}

      {/* 语言管理展开面板 */}
      {isLanguagePanelVisible && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: '800px',
          maxHeight: '80vh',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          zIndex: 1000,
          border: '1px solid #e1e4e8',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid #e1e4e8',
            backgroundColor: '#f6f8fa',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#24292f' }}>
              {getMessage('languageManagement', locale)}
            </h3>
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={() => setIsLanguagePanelVisible(false)}
              style={{ color: '#656d76' }}
            />
          </div>
          <div style={{
            padding: '24px',
            maxHeight: '60vh',
            overflow: 'auto'
          }}>
            <div style={{
              marginBottom: '20px'
            }}>
              <div style={{ 
                fontSize: '14px', 
                color: '#656d76',
                marginBottom: '16px'
              }}>
                {getMessage('activeLanguages', locale, { count: languages.length })}
              </div>
            </div>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              {[
                'english', 'chinese', 'thai', 'czech', 'slovak', 'italian', 'polish', 
                'latin', 'dutch', 'portuguese', 'greek', 'balkan', 'bulgarian', 'turkish', 
                'french', 'german', 'ukrainian', 'russian', 'south_african', 'arabic', 
                'norwegian', 'finnish', 'macedonian', 'estonian', 'slovenian', 'indonesian', 'swedish',
                'japanese', 'korean'
              ].map(lang => {
                const isActive = languages.includes(lang);
                return (
                  <div key={lang} style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '8px 12px',
                    backgroundColor: isActive ? '#f0f9ff' : '#f6f8fa',
                    borderRadius: '6px',
                    border: `1px solid ${isActive ? '#0ea5e9' : '#e1e4e8'}`,
                    gap: '8px',
                    cursor: lang === 'english' ? 'default' : 'pointer',
                    transition: 'all 0.2s ease',
                    opacity: lang === 'english' ? 1 : (isActive ? 1 : 0.6)
                  }}
                  onClick={() => {
                    if (lang !== 'english') {
                      handleToggleLanguage(lang, !isActive);
                    }
                  }}
                  >
                    <span style={{ 
                      fontSize: '14px', 
                      color: isActive ? '#0ea5e9' : '#656d76',
                      fontWeight: isActive ? '500' : '400'
                    }}>
                      {getBilingualLanguageName(lang)}
                    </span>
                    {lang === 'english' ? (
                      <span style={{ 
                        color: '#10b981', 
                        fontSize: '16px',
                        fontWeight: 'bold'
                      }}>
                        ✓
                      </span>
                    ) : (
                      <span style={{ 
                        color: isActive ? '#10b981' : '#ef4444', 
                        fontSize: '16px',
                        fontWeight: 'bold'
                      }}>
                        {isActive ? '✓' : '×'}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 标签管理展开面板 */}
      {isTagPanelVisible && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: '800px',
          maxHeight: '80vh',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          zIndex: 1000,
          border: '1px solid #e1e4e8',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid #e1e4e8',
            backgroundColor: '#f6f8fa',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#24292f' }}>
              {getMessage('tagManagement', locale)}
            </h3>
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={() => setIsTagPanelVisible(false)}
              style={{ color: '#656d76' }}
            />
          </div>
          <div style={{
            padding: '16px 24px',
            maxHeight: '60vh',
            overflow: 'auto'
          }}>
            <div style={{
              marginBottom: '12px'
            }}>
              {/* 移除了标题和按钮，将在标签列表中添加Add Tag按钮 */}
            </div>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              {tags.map(tag => (
                <div key={tag} style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 12px',
                  backgroundColor: '#f6f8fa',
                  borderRadius: '6px',
                  border: '1px solid #e1e4e8',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '14px', color: '#24292f' }}>
                    {tag}
                  </span>
                  <Popconfirm
                    title={getMessage('confirmDeleteTag', locale)}
                    onConfirm={async () => {
                      try {
                        // 使用父组件传递的handleDeleteTag函数
                        const result = await handleDeleteTag(tag);
                        if (result && result.onConfirm) {
                          await result.onConfirm();
                          // 关闭标签面板
                          setIsTagPanelVisible(false);
                        }
                      } catch (error) {
                        message.error(getMessage('operationFailed', locale));
                      }
                    }}
                    okText={getMessage('confirm', locale)}
                    cancelText={getMessage('cancel', locale)}
                  >
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      style={{ padding: '2px 4px' }}
                    />
                  </Popconfirm>
                </div>
              ))}
              {/* Add Tag 输入框，使用和标签相同的样式 */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#ffffff',
                borderRadius: '6px',
                border: '1px solid #e1e4e8',
                overflow: 'hidden',
                transition: 'all 0.2s ease',
                minWidth: '200px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#0969da';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e1e4e8';
              }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 12px',
                  flex: 1,
                  gap: '8px'
                }}>
                  <TagsOutlined style={{ fontSize: '14px', color: '#656d76' }} />
                  <input
                    type="text"
                    placeholder={getMessage('enterTag', locale)}
                    style={{
                      border: 'none',
                      outline: 'none',
                      fontSize: '14px',
                      color: '#24292f',
                      backgroundColor: 'transparent',
                      flex: 1,
                      minWidth: '0'
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const tagName = e.target.value.trim();
                        if (tagName) {
                          handleAddTag(tagName);
                          e.target.value = '';
                        }
                      }
                    }}
                  />
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 12px',
                  backgroundColor: '#f6f8fa',
                  borderLeft: '1px solid #e1e4e8',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
                onClick={(e) => {
                  const input = e.currentTarget.parentElement.querySelector('input');
                  const tagName = input.value.trim();
                  if (tagName) {
                    handleAddTag(tagName);
                    input.value = '';
                  }
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#eef0f2';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f6f8fa';
                }}
                >
                  <div style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#ffffff',
                    marginRight: '8px'
                  }} />
                  <span style={{ fontSize: '14px', color: '#24292f', fontWeight: '500' }}>
                    {getMessage('addTag', locale)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 主体内容区域 */}
      <div className="main-content-section" style={{ 
        padding: 0, 
        margin: 0,
        width: '100%',
        maxWidth: '100%',
        minWidth: 0,
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}>
        {/* 第一部分：标题和控制按钮 */}
        <div className="main-content-header">
          {/* 左侧：语言和标签选择 */}
          <div className="selection-area">
            <Select
              value={activeTab}
              onChange={setActiveTab}
              style={{ 
                width: 'auto',
                minWidth: '140px',
                flexShrink: 0,
                border: 'none',
                background: 'transparent',
                padding: 0
              }}
              placeholder={activeTab === 'all' ? 'ALL LANGUAGES' : getBilingualLanguageName(activeTab)}
              suffixIcon={null}
              className="breadcrumb-language-select"
              popupMatchSelectWidth={false}
              styles={{ popup: { root: { minWidth: '200px' } } }}
              optionLabelProp="label"
            >
              <Select.Option value="all" label="ALL LANGUAGES">
                <span>
                  <GlobalOutlined style={{ marginRight: '6px', color: '#0969da' }} />
                  {getMessage('allLanguages', locale)}
                </span>
              </Select.Option>
              {languages.slice(1).map(lang => (
                <Select.Option key={lang} value={lang} label={getBilingualLanguageName(lang)}>
                  <span>
                    <GlobalOutlined style={{ marginRight: '6px', color: '#0969da' }} />
                    {getBilingualLanguageName(lang)}
                  </span>
                </Select.Option>
              ))}
            </Select>
            <span style={{ 
              color: '#656d76', 
              fontWeight: '400',
              fontSize: '16px',
              flexShrink: 0
            }}>/</span>
            <Select
              value={currentTag}
              onChange={setCurrentTag}
              style={{ 
                width: 'auto',
                minWidth: '120px',
                flexShrink: 0,
                border: 'none',
                background: 'transparent',
                padding: 0
              }}
              placeholder={currentTag === 'all' ? 'ALL TAGS' : currentTag}
              suffixIcon={null}
              className="breadcrumb-tag-select"
              popupMatchSelectWidth={false}
              styles={{ popup: { root: { minWidth: '160px' } } }}
              optionLabelProp="label"
            >
              <Select.Option value="all" label="ALL TAGS">
                <span>
                  <TagsOutlined style={{ marginRight: '6px', color: '#0969da' }} />
                  ALL TAGS
                </span>
              </Select.Option>
              {tags.map(tag => (
                <Select.Option key={tag} value={tag} label={tag}>
                  <span>
                    <span style={{ 
                      marginRight: '6px', 
                      color: '#0969da',
                      fontSize: '14px',
                      fontWeight: '600',
                      fontFamily: 'monospace'
                    }}>
                      {tag.charAt(0).toUpperCase()}
                    </span>
                    {tag}
                  </span>
                </Select.Option>
              ))}
            </Select>
            <span style={{ 
              color: '#656d76', 
              fontWeight: '400',
              fontSize: '16px',
              flexShrink: 0
            }}>/</span>
            {/* Key筛选下拉选择器 */}
            <Select
              value={keyFilter || 'all'}
              onChange={(value) => setKeyFilter(value === 'all' ? null : value)}
              style={{ 
                width: 'auto',
                minWidth: '120px',
                flexShrink: 0,
                border: 'none',
                background: 'transparent',
                padding: 0
              }}
              placeholder={keyFilter === null ? 'KEY FILTER' : (keyFilter === 'withKey' ? `${getMessage('withKey', locale)} (${entriesWithKey})` : `${getMessage('withoutKey', locale)} (${entriesWithoutKey})`)}
              suffixIcon={null}
              className="breadcrumb-key-select"
              popupMatchSelectWidth={false}
              styles={{ popup: { root: { minWidth: '160px' } } }}
              optionLabelProp="label"
            >
              <Select.Option value="all" label="KEY FILTER">
                <span>
                  <KeyOutlined style={{ marginRight: '6px', color: '#0969da' }} />
                  KEY FILTER
                </span>
              </Select.Option>
              <Select.Option value="withKey" label={`${getMessage('withKey', locale)} (${entriesWithKey})`}>
                <span>
                  <span style={{ 
                    marginRight: '6px', 
                    color: '#0969da',
                    fontSize: '14px',
                    fontWeight: '600',
                    fontFamily: 'monospace'
                  }}>
                    ✓
                  </span>
                  {getMessage('withKey', locale)} ({entriesWithKey})
                </span>
              </Select.Option>
              <Select.Option value="withoutKey" label={`${getMessage('withoutKey', locale)} (${entriesWithoutKey})`}>
                <span>
                  <span style={{ 
                    marginRight: '6px', 
                    color: '#0969da',
                    fontSize: '14px',
                    fontWeight: '600',
                    fontFamily: 'monospace'
                  }}>
                    ✗
                  </span>
                  {getMessage('withoutKey', locale)} ({entriesWithoutKey})
                </span>
              </Select.Option>
            </Select>
          </div>
          
          {/* 右侧：操作按钮 */}
          <div className="action-buttons">


            {activeTab === 'all' ? (
              <Select
                placeholder={<DownloadOutlined style={{ color: '#0969da' }} />}
                style={{ 
                  width: '36px',
                  minWidth: '36px',
                  height: '36px',
                  flexShrink: 0
                }}
                suffixIcon={null}
                className="icon-only-select"
                popupMatchSelectWidth={false}
                styles={{ popup: { root: { minWidth: '200px' } } }}
                optionLabelProp="label"
                onSelect={(value) => {
                  if (value) {
                    exportLanguageData(value);
                  }
                }}
              >
                <Select.Option value="all" label={<DownloadOutlined style={{ color: '#0969da' }} />}>
                  <span>
                    <DownloadOutlined style={{ marginRight: '6px', color: '#0969da' }} />
                    {getMessage('exportAllLanguages', locale)}
                  </span>
                </Select.Option>
                {languages.slice(1).map(lang => (
                  <Select.Option key={lang} value={lang} label={<DownloadOutlined style={{ color: '#0969da' }} />}>
                    <span>
                      <DownloadOutlined style={{ marginRight: '6px', color: '#0969da' }} />
                      {getMessage('exportLanguageName', locale, { language: getBilingualLanguageName(lang) })}
                    </span>
                  </Select.Option>
                ))}
              </Select>
            ) : (
              <Button
                type="text"
                size="small"
                icon={<DownloadOutlined />}
                onClick={() => {
                  exportLanguageData(activeTab);
                }}
                className="icon-only-button"
                style={{
                  flexShrink: 0,
                  width: '36px',
                  minWidth: '36px',
                  height: '36px'
                }}
              />
            )}
            <Button
              type="text"
              size="small"
              icon={<PlusOutlined />}
              onClick={handleAddTranslation}
              className="add-translation-btn icon-only-button"
              style={{
                flexShrink: 0,
                width: '36px',
                minWidth: '36px',
                height: '36px'
              }}
            />
            <Button
              type="text"
              size="small"
              icon={<SearchOutlined />}
              onClick={handleSearchIconClick}
              className="icon-only-button"
              style={{
                flexShrink: 0,
                width: '36px',
                minWidth: '36px',
                height: '36px'
              }}
            />
          </div>
        </div>



        {/* 第三部分：卡片列表 */}
        <div style={{ 
          padding: '24px',
          backgroundColor: '#f8f9fa',
          minHeight: '400px',
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}>
          {loading ? (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              height: '200px'
            }}>
              <div>{getMessage('loading', locale)}</div>
            </div>
          ) : translations.length === 0 ? (
            <div className="empty-state" style={{
              textAlign: 'center',
              padding: '60px 20px',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e1e4e8'
            }}>
              <h3>{getMessage('noData', locale)}</h3>
              <p>{getMessage('noDataTip', locale)}</p>
            </div>
          ) : (
            <div className="translation-cards-container">
              <div className="translation-cards-grid" style={{ gap: '12px' }}>
              {filteredTranslations.map((record, index) => {
                const isExpanded = expandedCards.has(record.english_id);
                const isAllLanguagesMode = activeTab === 'all';
                
                return (
                  <Card
                    key={record.english_id}
                    className="translation-card"
                    styles={{ body: { padding: 0 } }}
                    style={{ 
                      position: 'relative',
                      borderRadius: '0px',
                      boxShadow: 'none'
                    }}
                  >
                      {/* 卡片右上角操作按钮 */}
                      <div className="card-actions" style={{
                        position: 'absolute',
                        top: '8px',
                        right: '12px',
                        zIndex: 10,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        {/* 展开/收起按钮 - 只在全部语言模式下显示 */}
                        {isAllLanguagesMode && (
                          <Button
                            type="text"
                            size="small"
                            icon={isExpanded ? <UpOutlined /> : <DownOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCardExpanded(record.english_id);
                            }}
                            className="card-action-btn"
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#656d76',
                              backgroundColor: 'rgba(255, 255, 255, 0.9)',
                              border: '1px solid #e1e4e8',
                              fontSize: '12px'
                            }}
                          />
                        )}
                        
                        <Button
                          type="text"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditTranslation(record);
                          }}
                          className="card-action-btn"
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#656d76',
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            border: '1px solid #e1e4e8',
                            fontSize: '12px'
                          }}
                        />
                        <Popconfirm
                          title={getMessage('confirmDelete', locale)}
                          onConfirm={() => handleDeleteTranslation(record.english_id)}
                          okText={getMessage('confirm', locale)}
                          cancelText={getMessage('cancel', locale)}
                        >
                          <Button
                            type="text"
                            size="small"
                            icon={<CloseOutlined />}
                            onClick={(e) => e.stopPropagation()}
                            className="card-action-btn delete-btn"
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#656d76',
                              backgroundColor: 'rgba(255, 255, 255, 0.9)',
                              border: '1px solid #e1e4e8',
                              fontSize: '12px'
                            }}
                          />
                        </Popconfirm>
                      </div>

                      {/* 英文内容 - 第一行 */}
                      <div 
                        className="translation-card-header"
                        style={{ 
                          cursor: isAllLanguagesMode ? 'pointer' : 'default',
                          transition: 'background-color 0.2s ease',
                          paddingRight: isAllLanguagesMode ? '100px' : '70px', // 全部语言模式需要更多空间
                          padding: '6px 12px 4px 12px' // 进一步减小内间距
                        }}
                        onClick={() => {
                          if (isAllLanguagesMode) {
                            toggleCardExpanded(record.english_id);
                          }
                        }}

                      >
                        <div className="translation-card-title">
                          {record.english || '-'}
                        </div>

                      </div>

                      {/* 其他语言内容 - 后续行 */}
                      {(!isAllLanguagesMode || isExpanded) && (
                        <div 
                          className="translation-card-body"
                          style={{
                            transition: 'all 0.3s ease',
                            padding: '4px 12px 6px 12px' // 进一步减小内间距
                          }}
                        >
                          {activeTab === 'all' ? (
                            // 显示所有激活的语言
                            languages.slice(1).map(lang => {
                              const translation = record.translations?.[lang];
                              return (
                                <div key={lang} className="translation-card-language-row" style={{ padding: '1px 0' }}>
                                  <div className="translation-card-language-label">
                                    {getBilingualLanguageName(lang)}
                                  </div>
                                  <div 
                                    className="translation-card-language-content"
                                    style={{
                                      color: translation ? '#24292f' : '#656d76',
                                      fontStyle: translation ? 'normal' : 'italic'
                                    }}
                                  >
                                    {translation || getMessage('noTranslation', locale)}
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            // 只显示当前选择的语言，不显示语言名称
                            <div className="translation-card-language-row" style={{ padding: '1px 0' }}>
                              <div 
                                className="translation-card-language-content"
                                style={{
                                  color: record.translations?.[activeTab] ? '#24292f' : '#656d76',
                                  fontStyle: record.translations?.[activeTab] ? 'normal' : 'italic',
                                  width: '100%'
                                }}
                              >
                                {record.translations?.[activeTab] || getMessage('noTranslation', locale)}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                  </Card>
                );
              })}
              </div>
            </div>
          )}
          
          {/* 加载更多和回到顶部 */}
          {translations.length > 0 && (
            <div style={{
              marginTop: '32px',
              display: 'flex',
              justifyContent: 'center',
              gap: '16px',
              alignItems: 'center'
            }}>
              {hasMore ? (
                <Button
                  type="primary"
                  size="large"
                  loading={loadingMore}
                  onClick={onLoadMore}
                  className="create-database-btn"
                  style={{
                    borderRadius: '8px',
                    padding: '12px 32px',
                    height: 'auto',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  {loadingMore ? getMessage('loading', locale) : getMessage('loadMore', locale)}
                </Button>
              ) : (
                <div style={{
                  backgroundColor: '#f8f9fa',
                  padding: '0px 24px',
                  borderRadius: '8px',
                  border: '1px solid #e1e4e8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '38px'
                }}>
                  <span style={{ fontSize: '14px', color: '#656d76', fontWeight: '500' }}>
                    {getMessage('noMoreData', locale)}
                  </span>
                </div>
              )}
              
              {/* 回到顶部按钮 */}
              <Button
                type="primary"
                size="large"
                onClick={() => {
                  window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                  });
                }}
                className="create-database-btn"
                style={{
                  borderRadius: '8px',
                  padding: '12px 32px',
                  height: 'auto',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                {getMessage('backToTop', locale)}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 搜索弹窗 */}
      <Modal
        title={getMessage('search', locale)}
        open={searchModalVisible}
        onOk={handleSearchModalOk}
        onCancel={() => setSearchModalVisible(false)}
        okText={getMessage('search', locale)}
        cancelText={getMessage('cancel', locale)}
        width={400}
      >
        <Input.Search
          placeholder={getMessage('searchPlaceholder', locale)}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onSearch={handleSearchModalOk}
          enterButton={false}
          style={{ width: '100%' }}
          autoFocus
        />
      </Modal>

      {/* 添加/编辑翻译模态框 */}
      <Modal
        title={editingTranslation ? getMessage('editTranslation', locale) : getMessage('addTranslationTitle', locale)}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={800}
        okText={getMessage('save', locale)}
        cancelText={getMessage('cancel', locale)}
        style={{ top: 40 }}
      >
        <Form
          form={form}
          layout="vertical"
          className="add-translation-form"
        >
          <Form.Item
            name="english"
            label={getMessage('englishContent', locale)}
            rules={[{ required: true, message: getMessage('englishPlaceholder', locale) }]}
          >
            <TextArea
              rows={3}
              placeholder={getMessage('englishPlaceholder', locale)}
              maxLength={500}
            />
          </Form.Item>

          <Form.Item
            name="key"
            label={getMessage('translationKey', locale)}
            rules={[
              { 
                pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/, 
                message: getMessage('keyRule', locale)
              }
            ]}
          >
            <Input
              placeholder={getMessage('keyPlaceholder', locale)}
              maxLength={50}
            />
          </Form.Item>

          <Form.Item
            name="tag"
            label={getMessage('tagLabel', locale)}
            initialValue=""
          >
            <Select
              placeholder={getMessage('tagPlaceholder', locale)}
              allowClear
              showSearch={false}
              options={tags.map(tag => ({ 
                value: tag, 
                label: tag
              }))}
            />
          </Form.Item>

          <div className="form-grid">
            {languages.slice(1).filter(lang => {
              // 如果是"all"视图，显示所有语言；否则只显示当前选择的语言
              return activeTab === 'all' || lang === activeTab;
            }).map(lang => (
              <Form.Item
                key={lang}
                name={lang}
                label={getBilingualLanguageName(lang)}
              >
                <TextArea
                  rows={2}
                  placeholder={getMessage('languagePlaceholder', locale, { language: getBilingualLanguageName(lang) })}
                />
              </Form.Item>
            ))}
          </div>
        </Form>
      </Modal>

      {/* 创建数据库模态框 */}
      <Modal
        title={getMessage('createNewDatabase', locale)}
        open={isDatabaseModalVisible}
        onOk={handleCreateDatabase}
        onCancel={() => {
          setIsDatabaseModalVisible(false);
          databaseForm.resetFields();
        }}
        width={500}
        okText={getMessage('createDatabase', locale)}
        cancelText={getMessage('cancel', locale)}
      >
        <Form
          form={databaseForm}
          layout="vertical"
        >
          <Form.Item
            name="databaseName"
            label={getMessage('databaseName', locale)}
            rules={[
              { required: true, message: getMessage('databaseNamePlaceholder', locale) },
              { 
                pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/, 
                message: getMessage('databaseNameRule', locale)
              },
              {
                validator: (_, value) => {
                  if (value && /\s/.test(value)) {
                    return Promise.reject(new Error('不能包含空格'));
                  }
                  if (value && /[^a-zA-Z0-9_]/.test(value)) {
                    return Promise.reject(new Error('只能包含英文、数字和下划线'));
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <Input
              placeholder={getMessage('databaseNamePlaceholder', locale)}
              maxLength={50}
              onKeyPress={(e) => {
                // 只允许输入英文、数字和下划线
                const allowedChars = /[a-zA-Z0-9_]/;
                if (!allowedChars.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab') {
                  e.preventDefault();
                }
              }}
              onPaste={(e) => {
                // 阻止粘贴包含特殊字符的内容
                const pastedText = e.clipboardData.getData('text');
                if (/[^a-zA-Z0-9_]/.test(pastedText)) {
                  e.preventDefault();
                }
              }}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 标签管理模态框 */}
      <Modal
        title={getMessage('addTag', locale)}
        open={isTagModalVisible}
        onOk={handleTagModalOk}
        onCancel={() => {
          setIsTagModalVisible(false);
          tagForm.resetFields();
        }}
        width={400}
        okText={getMessage('save', locale)}
        cancelText={getMessage('cancel', locale)}
      >
        <Form
          form={tagForm}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label={getMessage('tagName', locale)}
            rules={[
              { required: true, message: getMessage('tagNamePlaceholder', locale) },
              { 
                pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/, 
                message: getMessage('tagNameRule', locale)
              }
            ]}
          >
            <Input
              placeholder={getMessage('tagNamePlaceholder', locale)}
              maxLength={20}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 日志详情面板 */}
      <Modal
        title={getMessage('operationLogs', locale)}
        open={isLogPanelVisible}
        onCancel={() => setIsLogPanelVisible(false)}
        footer={null}
        width={600}
        style={{ top: 20 }}
      >
        <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {logs.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {logs.map((log, index) => (
                <div
                  key={index}
                  style={{
                    padding: '16px',
                    border: '1px solid #e1e4e8',
                    borderRadius: '6px',
                    backgroundColor: '#fafbfc'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      fontWeight: '500',
                      color: '#24292f'
                    }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: log.operation_type === '新增' ? '#dafbe1' : 
                                       log.operation_type === '更新' ? '#fff8c5' : 
                                       log.operation_type === '删除' ? '#ffebe9' : 
                                       log.operation_type === '新增标签' ? '#dafbe1' :
                                       log.operation_type === '删除标签' ? '#ffebe9' : '#f1f8ff',
                        color: log.operation_type === '新增' ? '#1a7f37' : 
                               log.operation_type === '更新' ? '#9a6700' : 
                               log.operation_type === '删除' ? '#cf222e' : 
                               log.operation_type === '新增标签' ? '#1a7f37' :
                               log.operation_type === '删除标签' ? '#cf222e' : '#0969da'
                      }}>
                        {translateLogOperation(log.operation_type)}
                      </span>
                      <span style={{ fontSize: '14px', color: '#656d76' }}>
                        {log.entry_count} {getMessage('logRecords', locale)}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#656d76' }}>
                      {log.operation_date}
                    </div>
                  </div>
                  <div style={{ fontSize: '14px', color: '#24292f', lineHeight: '1.4' }}>
                    {log.description}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px 20px',
              color: '#656d76'
            }}>
              <FileTextOutlined style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }} />
              <div style={{ fontSize: '16px', marginBottom: '8px' }}>
                {getMessage('noLogs', locale)}
              </div>
              <div style={{ fontSize: '14px', opacity: 0.7 }}>
                {getMessage('noLogs', locale)}
              </div>
            </div>
          )}
        </div>
      </Modal>


    </>
  );
};

export default TranslationContent;
