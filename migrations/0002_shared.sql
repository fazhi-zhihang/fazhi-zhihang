-- Shared plaza, exam scores, consult notes, and interview locks.
-- Feed rows are readable by any signed-in user. Writes stay tied to context.userId.

create table if not exists member_card (
  user_id text primary key,
  reveal text not null default 'momo',
  real_name text not null default '',
  school text not null default '',
  major text not null default '',
  grade text not null default '',
  city text not null default '',
  langs text not null default '',
  target text not null default '',
  bookmarks integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists plaza_items (
  id text primary key,
  user_id text not null,
  kind text not null,
  author_name text not null,
  title text not null default '',
  body text not null default '',
  topic text not null default '',
  media text not null default '',
  views integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists plaza_items_kind_created_idx on plaza_items (kind, created_at desc);

create table if not exists plaza_likes (
  item_id text not null references plaza_items (id) on delete cascade,
  user_id text not null,
  primary key (item_id, user_id)
);

create table if not exists plaza_comments (
  id text primary key,
  item_id text not null references plaza_items (id) on delete cascade,
  user_id text not null,
  author_name text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists plaza_comments_item_idx on plaza_comments (item_id, created_at);

create table if not exists exam_attempts (
  id text primary key,
  user_id text not null,
  paper_id text not null,
  score integer not null,
  total integer not null,
  created_at timestamptz not null default now()
);

create table if not exists legal_notes (
  id text primary key,
  user_id text not null,
  question text not null,
  summary text not null,
  created_at timestamptz not null default now()
);

create table if not exists interview_locks (
  id text primary key,
  user_id text not null,
  role_title text not null,
  average integer not null,
  summary text not null,
  created_at timestamptz not null default now()
);

insert into plaza_items (id, user_id, kind, author_name, title, body, topic)
values
  (
    'seed-post-1',
    'editorial',
    'post',
    '法智职航',
    '',
    '一年期合同把试用期写成四个月，签字也不能把期限变成合法。先对照资源库里的劳动合同法第十九条，再决定签不签。',
    '试用期'
  ),
  (
    'seed-post-2',
    'editorial',
    'post',
    '法智职航',
    '',
    '广场不提供匿名。愿意露姓名就用档案里的本名，不愿意的统一显示 momo。登录之后的赞和评论会留给其他同学，不只停在你自己的手机上。',
    '广场'
  ),
  (
    'seed-col-1',
    'editorial',
    'column',
    '法智职航',
    '签字前的四格',
    '主体全称是否和招聘方一致。报酬、岗位、地点有没有空着。试用期是否长过法定期限。竞业有没有范围，以及解除后按月经济补偿。这四格看不清，先不要签。空白页预签，后面填什么你都被动。',
    '签约'
  ),
  (
    'seed-col-2',
    'editorial',
    'column',
    '法智职航',
    '重复扣款怎么讲',
    '按钮禁用只是体验。服务端要用业务键挡住第二次成功扣款，并留下请求号。面试里先讲现象：谁在什么时间损失了什么。再讲你核对的证据，而不是猜测。最后给一个能回滚的下一步。',
    '工程'
  )
on conflict (id) do nothing;
